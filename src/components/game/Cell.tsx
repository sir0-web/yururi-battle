'use client';

import { BoardPiece } from '@/types/game';
import { SZ_LBL } from '@/utils/gameLogic';

interface Props {
  stack: BoardPiece[];
  isValid: boolean;
  isWin: boolean;
  onClick: () => void;
}

export default function Cell({ stack, isValid, isWin, onClick }: Props) {
  const top = stack.length > 0 ? stack[stack.length - 1] : null;

  const sizeClass = (sz: string) =>
    sz === 'L' ? 'w-[68%] h-[68%] text-base' :
    sz === 'M' ? 'w-[52%] h-[52%] text-sm' :
    'w-[36%] h-[36%] text-xs';

  return (
    <div
      onPointerDown={e => { e.preventDefault(); onClick(); }}
      className={`
        aspect-square rounded-xl flex items-center justify-center relative
        cursor-pointer transition-all duration-150
        shadow-[inset_0_2px_6px_rgba(0,0,0,0.07),0_2px_0_rgba(255,255,255,0.8)]
        ${isWin
          ? 'animate-pulse bg-yellow-300'
          : isValid
          ? 'bg-yellow-100 ring-2 ring-yellow-300 ring-offset-0'
          : 'bg-[#FAEFD8] hover:bg-yellow-100 hover:scale-105'
        }
      `}
    >
      {/* Ghost pieces */}
      {stack.slice(0, -1).map((p, i) => (
        <div
          key={i}
          className={`
            absolute rounded-full flex items-center justify-center
            font-black text-white opacity-30 scale-75
            ${sizeClass(p.sz)}
            ${p.player === 'p1'
              ? 'bg-red-400'
              : 'bg-teal-400'
            }
          `}
          style={{ zIndex: i + 1 }}
        >
          {SZ_LBL[p.sz]}
        </div>
      ))}

      {/* Top piece */}
      {top && (
        <div
          className={`
            absolute rounded-full flex items-center justify-center
            font-black text-white transition-all duration-200
            ${sizeClass(top.sz)}
            ${top.player === 'p1'
              ? 'bg-gradient-to-br from-red-300 to-red-400 shadow-[0_3px_0_#CC2222,0_4px_12px_rgba(255,107,107,0.4)]'
              : 'bg-gradient-to-br from-teal-300 to-teal-400 shadow-[0_3px_0_#1A9991,0_4px_12px_rgba(78,205,196,0.4)]'
            }
          `}
          style={{ zIndex: stack.length + 1 }}
        >
          {SZ_LBL[top.sz]}
          {stack.length > 1 && (
            <span className="absolute -bottom-1 -right-1 bg-yellow-400 border-2 border-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-black text-gray-600">
              {stack.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
}