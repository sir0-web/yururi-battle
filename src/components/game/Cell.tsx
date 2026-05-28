'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Attribute, BoardPiece } from '@/types/game';
import { SZ_LBL } from '@/utils/gameLogic';

interface Props {
  stack: BoardPiece[];
  isValid: boolean;
  isWin: boolean;
  onClick: () => void;
  p1Attr: Attribute;
  p2Attr: Attribute;
}

export default function Cell({ stack, isValid, isWin, onClick, p1Attr, p2Attr }: Props) {
  const top = stack.length > 0 ? stack[stack.length - 1] : null;

  const sizeClass = (sz: string) =>
    sz === 'L' ? 'w-[68%] h-[68%] text-base' :
    sz === 'M' ? 'w-[52%] h-[52%] text-sm' :
    'w-[36%] h-[36%] text-xs';

  const getAttrGlow = (player: 'p1' | 'p2') => {
    const attr = player === 'p1' ? p1Attr : p2Attr;
    switch (attr) {
      case 'fire':    return 'shadow-[0_3px_0_#CC2222,0_4px_14px_rgba(255,100,0,0.6)]';
      case 'water':   return 'shadow-[0_3px_0_#1A9991,0_4px_14px_rgba(0,150,255,0.5)]';
      case 'thunder': return 'shadow-[0_3px_0_#CC2222,0_4px_14px_rgba(255,220,0,0.7)]';
      case 'dark':    return 'shadow-[0_3px_0_#2d1b69,0_4px_14px_rgba(100,0,200,0.5)]';
      case 'light':   return 'shadow-[0_3px_0_#999900,0_4px_14px_rgba(255,255,0,0.6)]';
      default:
        return player === 'p1'
          ? 'shadow-[0_3px_0_#CC2222,0_4px_12px_rgba(255,107,107,0.4)]'
          : 'shadow-[0_3px_0_#1A9991,0_4px_12px_rgba(78,205,196,0.4)]';
    }
  };

  const getAttrEmoji = (player: 'p1' | 'p2') => {
    const attr = player === 'p1' ? p1Attr : p2Attr;
    switch (attr) {
      case 'fire':    return '🔥';
      case 'water':   return '💧';
      case 'thunder': return '⚡';
      case 'dark':    return '🌑';
      case 'light':   return '🌟';
      default: return null;
    }
  };

  return (
    <motion.div
      onPointerDown={e => { e.preventDefault(); onClick(); }}
      whileHover={!isWin ? { scale: 1.06 } : {}}
      whileTap={{ scale: 0.94 }}
      animate={isWin ? {
        scale: [1, 1.08, 1],
        backgroundColor: ['#fef08a', '#fde047', '#fef08a']
      } : {}}
      transition={isWin ? { duration: 0.6, repeat: Infinity } : { duration: 0.15 }}
      className={`
        aspect-square rounded-xl flex items-center justify-center relative
        cursor-pointer
        shadow-[inset_0_2px_6px_rgba(0,0,0,0.07),0_2px_0_rgba(255,255,255,0.8)]
        ${isValid ? 'bg-yellow-100 ring-2 ring-yellow-300' : 'bg-[#FAEFD8]'}
      `}
    >
      {/* Valid pulse ring */}
      <AnimatePresence>
        {isValid && (
          <motion.div
            className="absolute inset-0 rounded-xl ring-2 ring-yellow-400 pointer-events-none"
            initial={{ opacity: 0.6, scale: 0.85 }}
            animate={{ opacity: 0, scale: 1.15 }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </AnimatePresence>

      {/* Ghost pieces */}
      {stack.slice(0, -1).map((p, i) => (
        <div
          key={i}
          className={`
            absolute rounded-full flex items-center justify-center
            font-black text-white opacity-30 scale-75
            ${sizeClass(p.sz)}
            ${p.player === 'p1' ? 'bg-red-400' : 'bg-teal-400'}
          `}
          style={{ zIndex: i + 1 }}
        >
          {SZ_LBL[p.sz]}
        </div>
      ))}

      {/* Top piece */}
      <AnimatePresence mode="wait">
        {top && (
          <motion.div
            key={`${top.player}-${top.sz}-${stack.length}`}
            initial={{ scale: 0.1, opacity: 0, rotate: -15 }}
            animate={{
              scale: 1,
              opacity: top.stealth ? 0.35 : 1,
              rotate: 0,
            }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className={`
              absolute rounded-full flex items-center justify-center
              font-black text-white
              ${sizeClass(top.sz)}
              ${top.player === 'p1'
                ? `bg-gradient-to-br from-red-300 to-red-400 ${getAttrGlow('p1')}`
                : `bg-gradient-to-br from-teal-300 to-teal-400 ${getAttrGlow('p2')}`
              }
            `}
            style={{ zIndex: stack.length + 1 }}
          >
            {SZ_LBL[top.sz]}

            {/* 属性アイコン */}
            {getAttrEmoji(top.player) && (
              <span className="absolute -top-1 -right-1 text-[10px] leading-none">
                {getAttrEmoji(top.player)}
              </span>
            )}

            {/* 光シールド */}
            {top.shield && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-yellow-300 pointer-events-none"
                animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            )}

            {/* スタック数 */}
            {stack.length > 1 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-1 -right-1 bg-yellow-400 border-2 border-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-black text-gray-600"
              >
                {stack.length}
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}