'use client';

import { Piece, Player, SelectedPiece } from '@/types/game';
import { SZ_LBL } from '@/utils/gameLogic';

interface Props {
  player: Player;
  name: string;
  pieces: Piece[];
  sel: SelectedPiece | null;
  isActive: boolean;
  isCpuTurn: boolean;
  onSelect: (player: Player, idx: number) => void;
}

export default function PlayerPanel({ player, name, pieces, sel, isActive, isCpuTurn, onSelect }: Props) {
  return (
    <div className={`
      bg-white rounded-2xl p-3 shadow-md border-2 transition-all duration-200
      ${isActive
        ? player === 'p1'
          ? 'border-red-400 shadow-red-200 -translate-y-0.5'
          : 'border-teal-400 shadow-teal-200 -translate-y-0.5'
        : 'border-transparent'
      }
    `}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base
          ${player === 'p1' ? 'bg-red-100' : 'bg-teal-100'}`}>
          {player === 'p1' ? '🐣' : '🐧'}
        </div>
        <span className="font-black text-sm truncate">{name}</span>
      </div>
      <div className="flex flex-wrap gap-1 min-h-7">
        {pieces.map((piece, idx) => {
          const isSel = sel?.player === player && sel?.idx === idx;
          const sizeClass = piece.sz === 'L' ? 'w-9 h-9 text-sm' : piece.sz === 'M' ? 'w-7 h-7 text-xs' : 'w-5 h-5 text-[9px]';
          return (
            <button
              key={piece.id}
              onPointerDown={e => { e.preventDefault(); if (!piece.used && !isCpuTurn) onSelect(player, idx); }}
              disabled={piece.used || isCpuTurn}
              className={`
                rounded-full font-black text-white flex items-center justify-center
                transition-all duration-150 ${sizeClass}
                ${piece.used ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1'}
                ${player === 'p1'
                  ? 'bg-red-400 shadow-[0_3px_0_#CC2222]'
                  : 'bg-teal-400 shadow-[0_3px_0_#1A9991]'
                }
                ${isSel ? 'scale-110 ring-2 ring-yellow-400 ring-offset-1' : ''}
              `}
            >
              {SZ_LBL[piece.sz]}
            </button>
          );
        })}
      </div>
    </div>
  );
}