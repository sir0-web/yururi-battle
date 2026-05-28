'use client';

import { motion } from 'framer-motion';
import { Attribute, ATTRIBUTE_INFO, Player } from '@/types/game';

interface Props {
  player: Player;
  selected: Attribute;
  onSelect: (attr: Attribute) => void;
  onConfirm: () => void;
  isLocal: boolean;
}

const ATTRS: Attribute[] = ['fire', 'water', 'thunder', 'dark', 'light', 'none'];

export default function AttributeSelect({ player, selected, onSelect, onConfirm, isLocal }: Props) {
  const playerColor = player === 'p1' ? 'text-red-500' : 'text-teal-500';
  const playerEmoji = player === 'p1' ? '🐣' : '🐧';
  const playerName = player === 'p1' ? 'プレイヤー1' : (isLocal ? 'プレイヤー2' : 'CPU');

  return (
    <div className="min-h-screen bg-[#FFF9F0] flex flex-col items-center justify-center px-4">
      <motion.div
        className="w-full max-w-sm flex flex-col gap-5"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            className="text-5xl mb-2"
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {playerEmoji}
          </motion.div>
          <div className={`font-black text-xl ${playerColor}`} style={{ fontFamily: "'Fredoka One', cursive" }}>
            {playerName}
          </div>
          <div className="text-gray-500 font-bold text-sm mt-1">属性を選んでね！</div>
        </div>

        {/* Attribute grid */}
        <div className="grid grid-cols-2 gap-3">
          {ATTRS.map(attr => {
            const info = ATTRIBUTE_INFO[attr];
            const isSel = selected === attr;
            return (
              <motion.button
                key={attr}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onPointerDown={() => onSelect(attr)}
                className={`
                  relative rounded-2xl p-3 text-left border-2 transition-colors
                  ${isSel
                    ? 'border-yellow-400 bg-yellow-50 shadow-[0_4px_0_#DCC89A]'
                    : 'border-amber-100 bg-white shadow-md'
                  }
                `}
              >
                {isSel && (
                  <motion.div
                    className="absolute top-2 right-2 text-yellow-400 text-sm font-black"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    ✓
                  </motion.div>
                )}
                <div className="text-3xl mb-1">{info.emoji}</div>
                <div className="font-black text-sm text-gray-700">{info.label}属性</div>
                <div className="text-xs text-gray-400 mt-0.5 leading-tight">{info.desc}</div>
                {/* Color bar */}
                <div className={`mt-2 h-1 rounded-full bg-gradient-to-r ${info.color} opacity-70`} />
              </motion.button>
            );
          })}
        </div>

        {/* Confirm */}
        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97, y: 2 }}
          onPointerDown={onConfirm}
          className={`
            w-full py-4 rounded-full font-black text-lg text-white
            bg-gradient-to-r ${ATTRIBUTE_INFO[selected].color}
            shadow-[0_5px_0_rgba(0,0,0,0.15)]
          `}
        >
          {ATTRIBUTE_INFO[selected].emoji} {ATTRIBUTE_INFO[selected].label}属性で決定！
        </motion.button>
      </motion.div>
    </div>
  );
}