'use client';

import { motion, AnimatePresence } from 'framer-motion';
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
    <motion.div
      animate={isActive ? { y: -3 } : { y: 0 }}
      transition={{ duration: 0.2 }}
      className={`
        bg-white rounded-2xl p-3 shadow-md border-2 transition-colors duration-200
        ${isActive
          ? player === 'p1'
            ? 'border-red-400 shadow-red-200'
            : 'border-teal-400 shadow-teal-200'
          : 'border-transparent'
        }
      `}
    >
      <div className="flex items-center gap-2 mb-2">
        <motion.div
          animate={isActive ? { rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 0.5, repeat: isActive ? Infinity : 0, repeatDelay: 2 }}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-base
            ${player === 'p1' ? 'bg-red-100' : 'bg-teal-100'}`}
        >
          {player === 'p1' ? '🐣' : '🐧'}
        </motion.div>
        <span className="font-black text-sm truncate">{name}</span>
      </div>

      <div className="flex flex-wrap gap-1 min-h-7">
        <AnimatePresence>
          {pieces.map((piece, idx) => {
            const isSel = sel?.player === player && sel?.idx === idx;
            const sizeClass = piece.sz === 'L' ? 'w-9 h-9 text-sm' : piece.sz === 'M' ? 'w-7 h-7 text-xs' : 'w-5 h-5 text-[9px]';
            return (
              <motion.button
                key={piece.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: piece.used ? 0.8 : isSel ? 1.18 : 1,
                  opacity: piece.used ? 0.2 : 1,
                  y: isSel ? -3 : 0,
                }}
                whileHover={!piece.used && !isCpuTurn ? { y: -4, scale: 1.1 } : {}}
                whileTap={!piece.used && !isCpuTurn ? { scale: 0.92 } : {}}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                onPointerDown={e => { e.preventDefault(); if (!piece.used && !isCpuTurn) onSelect(player, idx); }}
                disabled={piece.used || isCpuTurn}
                className={`
                  rounded-full font-black text-white flex items-center justify-center
                  ${sizeClass}
                  ${piece.used ? 'cursor-not-allowed' : 'cursor-pointer'}
                  ${player === 'p1'
                    ? 'bg-red-400 shadow-[0_3px_0_#CC2222]'
                    : 'bg-teal-400 shadow-[0_3px_0_#1A9991]'
                  }
                  ${isSel ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}
                `}
              >
                {SZ_LBL[piece.sz]}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
