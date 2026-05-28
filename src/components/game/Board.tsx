'use client';

import { BoardPiece, SelectedPiece } from '@/types/game';
import Cell from './Cell';

interface Props {
  board: BoardPiece[][];
  sel: SelectedPiece | null;
  winLine: number[] | null;
  canPlaceCheck: (sz: string, ci: number) => boolean;
  onCell: (ci: number) => void;
}

export default function Board({ board, sel, winLine, canPlaceCheck, onCell }: Props) {
  return (
    <div className="flex items-center justify-center w-full">
      <div className="
        grid grid-cols-3 gap-2 p-4 w-full max-w-sm
        bg-[#F5E6C8] rounded-3xl
        shadow-[0_8px_32px_rgba(0,0,0,0.18),inset_0_2px_8px_rgba(0,0,0,0.06)]
        relative
      ">
        {board.map((stack, ci) => (
          <Cell
            key={ci}
            stack={stack}
            isValid={!!sel && canPlaceCheck(sel.sz, ci)}
            isWin={!!winLine && winLine.includes(ci)}
            onClick={() => onCell(ci)}
          />
        ))}
      </div>
    </div>
  );
}