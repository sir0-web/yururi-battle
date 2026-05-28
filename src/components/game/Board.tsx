'use client';

import { motion } from 'framer-motion';
import { Attribute, BoardPiece, SelectedPiece } from '@/types/game';
import Cell from './Cell';

interface Props {
  board: BoardPiece[][];
  sel: SelectedPiece | null;
  winLine: number[] | null;
  canPlaceCheck: (sz: string, ci: number) => boolean;
  onCell: (ci: number) => void;
  p1Attr: Attribute;
  p2Attr: Attribute;
}

export default function Board({ board, sel, winLine, canPlaceCheck, onCell, p1Attr, p2Attr }: Props) {
  return (
    <div className="flex items-center justify-center w-full">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          padding: 18,
          width: '100%',
          maxWidth: 340,
          borderRadius: 28,
          background: 'linear-gradient(145deg,#F0D9A8,#E8C98A)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18), inset 0 2px 8px rgba(0,0,0,0.08), inset 0 -2px 4px rgba(255,255,255,0.5)',
          position: 'relative',
        }}
      >
        {/* 木目テクスチャ風ライン */}
        {[0,1].map(i => (
          <div key={i} style={{
            position: 'absolute',
            left: `${33.3 * (i + 1)}%`,
            top: 12, bottom: 12,
            width: 2,
            background: 'rgba(180,140,60,0.25)',
            borderRadius: 2,
            pointerEvents: 'none',
          }} />
        ))}
        {[0,1].map(i => (
          <div key={i} style={{
            position: 'absolute',
            top: `${33.3 * (i + 1)}%`,
            left: 12, right: 12,
            height: 2,
            background: 'rgba(180,140,60,0.25)',
            borderRadius: 2,
            pointerEvents: 'none',
          }} />
        ))}

        {board.map((stack, ci) => (
          <Cell
            key={ci}
            stack={stack}
            isValid={!!sel && canPlaceCheck(sel.sz, ci)}
            isWin={!!winLine && winLine.includes(ci)}
            onClick={() => onCell(ci)}
            p1Attr={p1Attr}
            p2Attr={p2Attr}
          />
        ))}
      </motion.div>
    </div>
  );
}