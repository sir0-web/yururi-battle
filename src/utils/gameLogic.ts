import { BoardPiece, GameState, Piece, PieceSize, Player } from '@/types/game';

export const SZ_VAL: Record<PieceSize, number> = { L: 3, M: 2, S: 1 };
export const SZ_LBL: Record<PieceSize, string> = { L: '大', M: '中', S: '小' };

export const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const INIT_PIECES: PieceSize[] = ['L', 'L', 'M', 'M', 'M', 'S', 'S', 'S'];

export function createInitialState(): GameState {
  return {
    board: Array(9).fill(null).map(() => []),
    pieces: {
      p1: INIT_PIECES.map((sz, i) => ({ id: `p1-${i}`, sz, used: false })),
      p2: INIT_PIECES.map((sz, i) => ({ id: `p2-${i}`, sz, used: false })),
    },
    cur: 'p1',
    winner: null,
    winLine: null,
    draw: false,
  };
}

export function canPlace(sz: PieceSize, cellIdx: number, board: BoardPiece[][]): boolean {
  const stack = board[cellIdx];
  if (!stack.length) return true;
  return SZ_VAL[sz] > SZ_VAL[stack[stack.length - 1].sz];
}

export function checkWin(board: BoardPiece[][]): { winner: Player | null; line: number[] | null } {
  for (const line of WIN_LINES) {
    const tops = line.map(i => {
      const s = board[i];
      return s.length ? s[s.length - 1] : null;
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

export interface CpuMove {
  pi: number;
  ci: number;
  sz: PieceSize;
}

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

export function bestMove(
  difficulty: string,
  pieces: Record<Player, Piece[]>,
  board: BoardPiece[][]
): CpuMove | null {
  const avail = getAvailMoves('p2', pieces, board);
  if (!avail.length) return null;
  if (difficulty === 'easy' && Math.random() < 0.45) return avail[Math.floor(Math.random() * avail.length)];

  for (const mv of avail) if (simWin('p2', mv, board)) return mv;
  for (const mv of avail) if (simBlock(mv, pieces, board)) return mv;
  if (difficulty === 'easy') return avail[Math.floor(Math.random() * avail.length)];

  const pri = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  for (const ci of pri) {
    const cands = avail.filter(m => m.ci === ci);
    if (cands.length) {
      cands.sort((a, b) => SZ_VAL[a.sz] - SZ_VAL[b.sz]);
      return cands[0];
    }
  }
  return avail[0];
}