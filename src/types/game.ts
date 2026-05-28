export type Player = 'p1' | 'p2';
export type PieceSize = 'L' | 'M' | 'S';
export type GameMode = 'local' | 'cpu';
export type CpuDifficulty = 'easy' | 'normal' | 'hard';

export interface Piece {
  id: string;
  sz: PieceSize;
  used: boolean;
}

export interface BoardPiece {
  player: Player;
  sz: PieceSize;
}

export interface GameState {
  board: BoardPiece[][];
  pieces: Record<Player, Piece[]>;
  cur: Player;
  winner: Player | null;
  winLine: number[] | null;
  draw: boolean;
}

export interface SelectedPiece {
  player: Player;
  idx: number;
  sz: PieceSize;
}