export type Player = 'p1' | 'p2';
export type PieceSize = 'L' | 'M' | 'S';
export type GameMode = 'local' | 'cpu';
export type CpuDifficulty = 'easy' | 'normal' | 'hard';
export type Attribute = 'fire' | 'water' | 'thunder' | 'dark' | 'light' | 'none';

export interface Piece {
  id: string;
  sz: PieceSize;
  used: boolean;
}

export interface BoardPiece {
  player: Player;
  sz: PieceSize;
  stealth?: boolean;  // 闇属性
  shield?: boolean;   // 光属性
}

export interface GameState {
  board: BoardPiece[][];
  pieces: Record<Player, Piece[]>;
  cur: Player;
  winner: Player | null;
  winLine: number[] | null;
  draw: boolean;
  attributes: Record<Player, Attribute>;
  extraTurn: boolean;       // 雷属性の追加行動
  lastEffect: EffectEvent | null;
}

export interface EffectEvent {
  type: 'explosion' | 'shield_break' | 'extra_turn' | 'stealth';
  cells?: number[];
  player?: Player;
}

export interface SelectedPiece {
  player: Player;
  idx: number;
  sz: PieceSize;
}

export const ATTRIBUTE_INFO: Record<Attribute, { label: string; emoji: string; desc: string; color: string }> = {
  fire:    { label: '火',   emoji: '🔥', desc: '上書き時、隣接コマを爆発！',     color: 'from-red-400 to-orange-400' },
  water:   { label: '水',   emoji: '💧', desc: '相手の隠れコマが見える！',       color: 'from-blue-400 to-cyan-400' },
  thunder: { label: '雷',   emoji: '⚡', desc: '上書き成功でもう1手！',          color: 'from-yellow-400 to-amber-400' },
  dark:    { label: '闇',   emoji: '🌑', desc: '置いた瞬間1ターン見えない！',    color: 'from-purple-500 to-indigo-500' },
  light:   { label: '光',   emoji: '🌟', desc: '1回だけ上書きに耐える！',        color: 'from-yellow-300 to-lime-300' },
  none:    { label: 'なし', emoji: '⬜', desc: '属性なし',                       color: 'from-gray-300 to-gray-400' },
};