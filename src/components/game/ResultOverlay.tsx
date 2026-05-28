'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { GameMode, Player } from '@/types/game';
import { useEffect, useState } from 'react';

interface Props {
  winner: Player | null;
  draw: boolean;
  mode: GameMode;
  onRematch: () => void;
  onTitle: () => void;
}

function Confetti() {
  const [pieces, setPieces] = useState<{ id: number; x: number; color: string; delay: number; duration: number }[]>([]);

  useEffect(() => {
    const colors = ['#FF6B6B','#4ECDC4','#FFE66D','#A8E6CF','#FF8B94','#FFD93D'];
    setPieces(Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.6,
      duration: 1.2 + Math.random() * 0.8,
    })));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          className="absolute w-2 h-2 rounded-sm"
          style={{ left: `${p.x}%`, background: p.color }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: '105vh', opacity: 0, rotate: 720 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}

export default function ResultOverlay({ winner, draw, mode, onRematch, onTitle }: Props) {
  const emoji = draw ? '🤝' : winner === 'p1' ? '🎉' : mode === 'cpu' ? '🤖' : '🎉';
  const title = draw ? '引き分け！' : winner === 'p1' ? 'P1の勝利！' : mode === 'cpu' ? 'CPUの勝ち…' : 'P2の勝利！';
  const sub = draw ? 'お互いすごかった！' : winner === 'p1'
    ? (mode === 'cpu' ? 'CPUに勝った！すごい！' : 'おめでとう！')
    : (mode === 'cpu' ? 'またチャレンジ！' : 'おめでとう！');
  const titleColor = winner === 'p1' ? 'text-red-600' : winner === 'p2' ? 'text-teal-600' : 'text-gray-700';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Confetti */}
        {!draw && <Confetti />}

        {/* Card */}
        <motion.div
          className="relative bg-white rounded-3xl px-8 py-9 text-center max-w-xs w-[90%] shadow-2xl z-50"
          initial={{ scale: 0.3, opacity: 0, y: 60 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22, delay: 0.1 }}
        >
          <motion.div
            className="text-7xl mb-2 inline-block"
            animate={{ rotate: [-10, 10, -10], scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          >
            {emoji}
          </motion.div>

          <motion.div
            className={`font-black text-3xl mb-1 ${titleColor}`}
            style={{ fontFamily: "'Fredoka One', cursive" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {title}
          </motion.div>

          <motion.div
            className="text-gray-500 font-bold text-base mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            {sub}
          </motion.div>

          <motion.div
            className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96, y: 2 }}
              onPointerDown={onRematch}
              className="bg-gradient-to-r from-red-400 to-orange-400 text-white font-black text-lg py-3 px-6 rounded-full shadow-[0_5px_0_#CC3300] transition-shadow"
            >
              🔄 もう一度！
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onPointerDown={onTitle}
              className="bg-white text-gray-700 font-black text-sm py-2 px-5 rounded-full border-2 border-amber-200 shadow-[0_3px_0_#DCC89A] transition-shadow"
            >
              🏠 タイトルへ
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}