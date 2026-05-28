import { Attribute, BoardPiece, EffectEvent, GameState, Piece, PieceSize, Player } from '@/types/game';

export const SZ_VAL: Record<PieceSize, number> = { L: 3, M: 2, S: 1 };
export const SZ_LBL: Record<PieceSize, string> = { L: '大', M: '中', S: '小' };

export const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const ADJACENT: Record<number, number[]> = {
  0:[1,3,4], 1:[0,2,3,4,5], 2:[1,4,5],
  3:[0,1,4,6,7], 4:[0,1,2,3,5,6,7,8], 5:[1,2,4,7,8],
  6:[3,4,7], 7:[3,4,5,6,8], 8:[4,5,7],
};

const INIT_SIZES: PieceSize[] = ['L','L','M','M','M','S','S','S'];

export function createInitialState(attributes: Record<Player, Attribute>): GameState {
  return {
    board: Array(9).fill(null).map(() => []),
    pieces: {
      p1: INIT_SIZES.map((sz, i) => ({ id: `p1-${i}`, sz, used: false })),
      p2: INIT_SIZES.map((sz, i) => ({ id: `p2-${i}`, sz, used: false })),
    },
    cur: 'p1',
    winner: null,
    winLine: null,
    draw: false,
    attributes,
    extraTurn: false,
    lastEffect: null,
  };
}

export function canPlace(sz: PieceSize, cellIdx: number, board: BoardPiece[][]): boolean {
  const stack = board[cellIdx];
  if (!stack.length) return true;
  const top = stack[stack.length - 1];
  // 光属性のシールドがあっても上書き試行は可能（シールドが壊れる）
  return SZ_VAL[sz] > SZ_VAL[top.sz];
}

export function checkWin(board: BoardPiece[][]): { winner: Player | null; line: number[] | null } {
  for (const line of WIN_LINES) {
    const tops = line.map(i => {
      const s = board[i];
      if (!s.length) return null;
      const top = s[s.length - 1];
      // ステルス中のコマは判定しない
      if (top.stealth) return null;
      return top;
    });
    if (
      tops[0] && tops[1] && tops[2] &&
      tops[0].player === tops[1].player &&
      tops[1].player === tops[2].player
    ) {
      return { winner: tops[0].player, line };
    }
  }
  return { winner: null, line: null };
}

export function checkDraw(pieces: Record<Player, Piece[]>): boolean {
  return pieces.p1.every(p => p.used) && pieces.p2.every(p => p.used);
}

export function applyPlace(
  state: GameState,
  player: Player,
  pieceIdx: number,
  cellIdx: number
): GameState {
  const piece = state.pieces[player][pieceIdx];
  const attr = state.attributes[player];
  const newBoard = state.board.map(s => [...s.map(p => ({ ...p }))]);
  const stack = newBoard[cellIdx];
  const wasOverwrite = stack.length > 0;
  let effect: EffectEvent | null = null;
  let extraTurn = false;

  // 光属性チェック：相手コマにシールドがあれば壊して終了
  if (wasOverwrite) {
    const top = stack[stack.length - 1];
    if (top.shield && top.player !== player) {
      // シールド破壊、コマは残る
      stack[stack.length - 1] = { ...top, shield: false };
      effect = { type: 'shield_break', cells: [cellIdx] };
      const newPieces = {
        p1: state.pieces.p1.map((p, i) => player === 'p1' && i === pieceIdx ? { ...p, used: true } : p),
        p2: state.pieces.p2.map((p, i) => player === 'p2' && i === pieceIdx ? { ...p, used: true } : p),
      };
      const nextPlayer: Player = player === 'p1' ? 'p2' : 'p1';
      return {
        ...state,
        board: newBoard,
        pieces: newPieces,
        cur: nextPlayer,
        lastEffect: effect,
        extraTurn: false,
      };
    }
  }

  // コマを置く
  const newPiece: BoardPiece = {
    player,
    sz: piece.sz,
    stealth: attr === 'dark' ? true : false,
    shield: attr === 'light' ? true : false,
  };
  stack.push(newPiece);

  // 🔥 火属性：隣接コマをダウングレード
  if (attr === 'fire' && wasOverwrite) {
    const affectedCells: number[] = [];
    ADJACENT[cellIdx].forEach(adj => {
      const adjStack = newBoard[adj];
      if (!adjStack.length) return;
      const adjTop = adjStack[adjStack.length - 1];
      if (adjTop.player !== player) {
        if (adjTop.sz === 'L') {
          adjStack[adjStack.length - 1] = { ...adjTop, sz: 'M' };
          affectedCells.push(adj);
        } else if (adjTop.sz === 'M') {
          adjStack[adjStack.length - 1] = { ...adjTop, sz: 'S' };
          affectedCells.push(adj);
        } else if (adjTop.sz === 'S') {
          adjStack.pop();
          affectedCells.push(adj);
        }
      }
    });
    if (affectedCells.length) effect = { type: 'explosion', cells: affectedCells };
  }

  // ⚡ 雷属性：上書き成功で追加ターン
  if (attr === 'thunder' && wasOverwrite) {
    extraTurn = true;
    effect = { type: 'extra_turn', player };
  }

  // 🌑 闇属性：1ターン後にステルス解除
  if (attr === 'dark') {
    effect = { type: 'stealth', player };
  }

  const newPieces = {
    p1: state.pieces.p1.map((p, i) => player === 'p1' && i === pieceIdx ? { ...p, used: true } : p),
    p2: state.pieces.p2.map((p, i) => player === 'p2' && i === pieceIdx ? { ...p, used: true } : p),
  };

  const { winner, line } = checkWin(newBoard);
  const draw = !winner && checkDraw(newPieces);
  const nextPlayer: Player = extraTurn ? player : (player === 'p1' ? 'p2' : 'p1');

  // ステルス解除（相手ターンが来たタイミングで解除）
  if (!extraTurn) {
    newBoard.forEach(stack => {
      stack.forEach((p, i) => {
        if (p.stealth && p.player === player) {
          stack[i] = { ...p, stealth: false };
        }
      });
    });
  }

  return {
    ...state,
    board: newBoard,
    pieces: newPieces,
    cur: winner || draw ? player : nextPlayer,
    winner,
    winLine: line,
    draw,
    extraTurn,
    lastEffect: effect,
  };
}

export interface CpuMove { pi: number; ci: number; sz: PieceSize; }

export function getAvailMoves(player: Player, pieces: Record<Player, Piece[]>, board: BoardPiece[][]): CpuMove[] {
  const out: CpuMove[] = [];
  pieces[player].forEach((p, pi) => {
    if (p.used) return;
    for (let ci = 0; ci < 9; ci++) {
      if (canPlace(p.sz, ci, board)) out.push({ pi, ci, sz: p.sz });
    }
  });
  return out;
}

function simWin(player: Player, mv: CpuMove, board: BoardPiece[][]): boolean {
  const b = board.map(s => [...s]);
  b[mv.ci].push({ player, sz: mv.sz });
  return WIN_LINES.some(line => {
    const t = line.map(i => { const s = b[i]; return s.length ? s[s.length - 1] : null; });
    return t[0] && t[1] && t[2] && t[0].player === player && t[1].player === player && t[2].player === player;
  });
}

function simBlock(mv: CpuMove, pieces: Record<Player, Piece[]>, board: BoardPiece[][]): boolean {
  const b = board.map(s => [...s]);
  b[mv.ci].push({ player: 'p2', sz: mv.sz });
  return pieces.p1.some((p, pi) => {
    if (p.used) return false;
    for (let ci = 0; ci < 9; ci++) {
      const s = b[ci];
      if (!s.length || SZ_VAL[p.sz] > SZ_VAL[s[s.length - 1].sz]) {
        const b2 = b.map(x => [...x]);
        b2[ci].push({ player: 'p1', sz: p.sz });
        if (WIN_LINES.some(l => {
          const t = l.map(i => { const ss = b2[i]; return ss.length ? ss[ss.length - 1] : null; });
          return t[0] && t[1] && t[2] && t[0].player === 'p1' && t[1].player === 'p1' && t[2].player === 'p1';
        })) return true;
      }
    }
    return false;
  });
}

export function bestMove(difficulty: string, pieces: Record<Player, Piece[]>, board: BoardPiece[][]): CpuMove | null {
  const avail = getAvailMoves('p2', pieces, board);
  if (!avail.length) return null;
  if (difficulty === 'easy' && Math.random() < 0.45) return avail[Math.floor(Math.random() * avail.length)];
  for (const mv of avail) if (simWin('p2', mv, board)) return mv;
  for (const mv of avail) if (simBlock(mv, pieces, board)) return mv;
  if (difficulty === 'easy') return avail[Math.floor(Math.random() * avail.length)];
  const pri = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  for (const ci of pri) {
    const cands = avail.filter(m => m.ci === ci);
    if (cands.length) { cands.sort((a, b) => SZ_VAL[a.sz] - SZ_VAL[b.sz]); return cands[0]; }
  }
  return avail[0];
}