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
  const attr = 'none' as Attribute; // 属性システム一時OFF
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

function canWinNext(player: Player, pieces: Record<Player, Piece[]>, board: BoardPiece[][]): boolean {
  const moves = getAvailMoves(player, pieces, board);
  for (const mv of moves) {
    if (simWin(player, mv, board)) return true;
  }
  return false;
}

function simBlock(mv: CpuMove, pieces: Record<Player, Piece[]>, board: BoardPiece[][]): boolean {
  // このマスに置かないと相手が次のターンに勝てるか？
  const b = board.map(s => [...s.map(p => ({...p}))]);
  b[mv.ci].push({ player: 'p2', sz: mv.sz });
  const np = { ...pieces, p2: pieces.p2.map((p,i) => i===mv.pi ? {...p,used:true} : p) };
  // 置いた後に相手が勝てるか
  return !canWinNext('p1', pieces, b);
}

function mustBlock(pieces: Record<Player, Piece[]>, board: BoardPiece[][]): CpuMove | null {
  // p1が今すぐ勝てる手があるか探して、それを防ぐ
  const p1Moves = getAvailMoves('p1', pieces, board);
  for (const pm of p1Moves) {
    if (simWin('p1', pm, board)) {
      // p1が勝てるマスをp2が上書きできるか？
      const p2Moves = getAvailMoves('p2', pieces, board);
      for (const mv of p2Moves) {
        if (mv.ci === pm.ci) return mv; // 同じマスに置いて阻止
      }
      // 同じマスに置けない場合、他の手で阻止できないので最大サイズで別マスを探す
      const blockMoves = p2Moves.filter(m => m.ci === pm.ci);
      if (blockMoves.length) return blockMoves.sort((a,b) => SZ_VAL[b.sz] - SZ_VAL[a.sz])[0];
    }
  }
  return null;
}

function countThreats(player: Player, board: BoardPiece[][]): number {
  let threats = 0;
  for (const line of WIN_LINES) {
    const tops = line.map(i => { const s = board[i]; return s.length ? s[s.length-1] : null; });
    const mine = tops.filter(t => t?.player === player).length;
    const empty = tops.filter(t => t === null).length;
    if (mine === 2 && empty >= 1) threats++;
  }
  return threats;
}

function scoreBoard(board: BoardPiece[][], pieces: Record<Player, Piece[]>): number {
  let score = 0;
  const pri = [4, 0, 2, 6, 8, 1, 3, 5, 7];

  // センター・コーナー制御
  for (let ci = 0; ci < 9; ci++) {
    const s = board[ci];
    if (!s.length) continue;
    const top = s[s.length - 1];
    const posScore = pri.indexOf(ci) <= 1 ? 3 : pri.indexOf(ci) <= 4 ? 2 : 1;
    if (top.player === 'p2') score += posScore + SZ_VAL[top.sz];
    else score -= posScore + SZ_VAL[top.sz];
  }

  // 脅威カウント
  score += countThreats('p2', board) * 10;
  score -= countThreats('p1', board) * 12;

  // コマ節約ボーナス
  const p2Remaining = pieces.p2.filter(p => !p.used).length;
  score += p2Remaining * 0.5;

  return score;
}

function minimax(
  board: BoardPiece[][],
  pieces: Record<Player, Piece[]>,
  depth: number,
  isMax: boolean,
  alpha: number,
  beta: number
): number {
  const { winner } = checkWin(board);
  if (winner === 'p2') return 1000 + depth;
  if (winner === 'p1') return -1000 - depth;
  if (checkDraw(pieces) || depth === 0) return scoreBoard(board, pieces);

  const player: Player = isMax ? 'p2' : 'p1';
  const moves = getAvailMoves(player, pieces, board);
  if (!moves.length) return scoreBoard(board, pieces);

  if (isMax) {
    let best = -Infinity;
    for (const mv of moves) {
      const nb = board.map(s => [...s.map(p => ({...p}))]);
      nb[mv.ci].push({ player, sz: mv.sz });
      const np = {
        p1: pieces.p1.map((p,i) => player==='p1'&&i===mv.pi ? {...p,used:true} : p),
        p2: pieces.p2.map((p,i) => player==='p2'&&i===mv.pi ? {...p,used:true} : p),
      };
      best = Math.max(best, minimax(nb, np, depth-1, false, alpha, beta));
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const mv of moves) {
      const nb = board.map(s => [...s.map(p => ({...p}))]);
      nb[mv.ci].push({ player, sz: mv.sz });
      const np = {
        p1: pieces.p1.map((p,i) => player==='p1'&&i===mv.pi ? {...p,used:true} : p),
        p2: pieces.p2.map((p,i) => player==='p2'&&i===mv.pi ? {...p,used:true} : p),
      };
      best = Math.min(best, minimax(nb, np, depth-1, true, alpha, beta));
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

export function bestMove(difficulty: string, pieces: Record<Player, Piece[]>, board: BoardPiece[][]): CpuMove | null {
  const avail = getAvailMoves('p2', pieces, board);
  if (!avail.length) return null;

  // やさしい：ランダム多め
  if (difficulty === 'easy' && Math.random() < 0.5) return avail[Math.floor(Math.random() * avail.length)];

  // 即勝ち
  for (const mv of avail) if (simWin('p2', mv, board)) return mv;
  // 即負け防ぐ
  for (const mv of avail) if (simBlock(mv, pieces, board)) return mv;

  if (difficulty === 'easy') return avail[Math.floor(Math.random() * avail.length)];

  // ふつう：1手先読み
  if (difficulty === 'normal') {
    const pri = [4, 0, 2, 6, 8, 1, 3, 5, 7];
    // 2手先の脅威を作る
    let bestMv = avail[0];
    let bestScore = -Infinity;
    for (const mv of avail) {
      const nb = board.map(s => [...s.map(p => ({...p}))]);
      nb[mv.ci].push({ player: 'p2', sz: mv.sz });
      const np = { ...pieces, p2: pieces.p2.map((p,i) => i===mv.pi ? {...p,used:true} : p) };
      const score = scoreBoard(nb, np);
      if (score > bestScore) { bestScore = score; bestMv = mv; }
    }
    return bestMv;
  }

  // むずかしい：minimax 3手先読み
  // アモン・ラー：minimax 5手先読み + 相手の全勝ち筋を潰す
  const depth = difficulty === 'amon' ? 5 : 3;

  if (difficulty === 'amon') {
    // 相手の2手先の脅威も全部潰す
    const p1Moves = getAvailMoves('p1', pieces, board);
    for (const pm of p1Moves) {
      const nb = board.map(s => [...s.map(p => ({...p}))]);
      nb[pm.ci].push({ player: 'p1', sz: pm.sz });
      const np = { ...pieces, p1: pieces.p1.map((p,i) => i===pm.pi ? {...p,used:true} : p) };
      // p1がこの手を打った後にさらに勝ち筋ができるか
      const p1Next = getAvailMoves('p1', np, nb);
      for (const pm2 of p1Next) {
        if (simWin('p1', pm2, nb)) {
          // p1の1手目を潰す
          const block = avail.find(m => m.ci === pm.ci);
          if (block) return block;
        }
      }
    }
  }

  let bestMv = avail[0];
  let bestScore = -Infinity;
  for (const mv of avail) {
    const nb = board.map(s => [...s.map(p => ({...p}))]);
    nb[mv.ci].push({ player: 'p2', sz: mv.sz });
    const np = { ...pieces, p2: pieces.p2.map((p,i) => i===mv.pi ? {...p,used:true} : p) };
    const score = minimax(nb, np, depth, false, -Infinity, Infinity);
    if (score > bestScore) { bestScore = score; bestMv = mv; }
  }
  return bestMv;
}