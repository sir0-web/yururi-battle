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

const ATTR_COLORS: Record<Attribute, { from: string; to: string; shadow: string; emoji: string }> = {
  fire:    { from: '#FF6B35', to: '#FF4500', shadow: '#CC2200', emoji: '🔥' },
  water:   { from: '#45D4FA', to: '#0EA5E9', shadow: '#0369A1', emoji: '💧' },
  thunder: { from: '#FFD700', to: '#F59E0B', shadow: '#B45309', emoji: '⚡' },
  dark:    { from: '#A78BFA', to: '#7C3AED', shadow: '#4C1D95', emoji: '🌑' },
  light:   { from: '#FDE68A', to: '#FBBF24', shadow: '#92400E', emoji: '🌟' },
  none:    { from: '', to: '', shadow: '', emoji: '' },
};

const P1_BASE = { from: '#FCA5A5', to: '#F87171', shadow: '#CC2222' };
const P2_BASE = { from: '#5EEAD4', to: '#2DD4BF', shadow: '#0F766E' };

export default function Cell({ stack, isValid, isWin, onClick, p1Attr, p2Attr }: Props) {
  const top = stack.length > 0 ? stack[stack.length - 1] : null;

  const getPieceStyle = (player: 'p1' | 'p2') => {
    const attr = player === 'p1' ? p1Attr : p2Attr;
    const base = player === 'p1' ? P1_BASE : P2_BASE;
    const ac = ATTR_COLORS[attr];
    const from = attr !== 'none' ? ac.from : base.from;
    const to   = attr !== 'none' ? ac.to   : base.to;
    const shadow = attr !== 'none' ? ac.shadow : base.shadow;
    return { from, to, shadow };
  };

  const sizeStyle = (sz: string) => {
    if (sz === 'L') return { width: '70%', height: '70%', fontSize: 'clamp(13px,4vw,20px)' };
    if (sz === 'M') return { width: '54%', height: '54%', fontSize: 'clamp(10px,3vw,16px)' };
    return { width: '38%', height: '38%', fontSize: 'clamp(8px,2.5vw,12px)' };
  };

  return (
    <motion.div
      onPointerDown={e => { e.preventDefault(); onClick(); }}
      whileHover={!isWin ? { scale: 1.07, y: -2 } : {}}
      whileTap={{ scale: 0.92 }}
      animate={isWin ? {
        boxShadow: [
          '0 0 0px rgba(255,220,0,0)',
          '0 0 24px rgba(255,220,0,0.9)',
          '0 0 0px rgba(255,220,0,0)',
        ],
      } : {}}
      transition={isWin ? { duration: 0.7, repeat: Infinity } : { duration: 0.13 }}
      style={{
        background: isWin
          ? 'linear-gradient(135deg,#FEF08A,#FDE047)'
          : isValid
          ? 'linear-gradient(135deg,#FEF9C3,#FEF08A)'
          : 'linear-gradient(135deg,#FDF3DC,#F5E6C0)',
        borderRadius: 14,
        aspectRatio: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'pointer',
        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.08), 0 3px 0 rgba(255,255,255,0.7)',
        overflow: 'visible',
      }}
    >
      {/* Valid pulse */}
      <AnimatePresence>
        {isValid && (
          <motion.div
            style={{ position: 'absolute', inset: 0, borderRadius: 14, border: '2.5px solid #FBBF24', pointerEvents: 'none' }}
            initial={{ opacity: 0.8, scale: 0.88 }}
            animate={{ opacity: 0, scale: 1.18 }}
            transition={{ duration: 0.75, repeat: Infinity }}
          />
        )}
      </AnimatePresence>

      {/* Ghost pieces */}
      {stack.slice(0, -1).map((p, i) => {
        const s = getPieceStyle(p.player);
        const sz = sizeStyle(p.sz);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: sz.width, height: sz.height,
              borderRadius: '50%',
              background: `linear-gradient(135deg,${s.from},${s.to})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, color: 'white',
              fontSize: sz.fontSize,
              opacity: 0.25,
              transform: 'scale(0.72)',
              zIndex: i + 1,
            }}
          >
            {SZ_LBL[p.sz]}
          </div>
        );
      })}

      {/* Top piece */}
      <AnimatePresence mode="wait">
        {top && (
          <motion.div
            key={`${top.player}-${top.sz}-${stack.length}`}
            initial={{ scale: 0.05, opacity: 0, rotate: -20, y: -10 }}
            animate={{ scale: 1, opacity: top.stealth ? 0.3 : 1, rotate: 0, y: 0 }}
            exit={{ scale: 0.4, opacity: 0, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            style={{ position: 'absolute', zIndex: stack.length + 1, ...sizeStyle(top.sz) }}
          >
            {(() => {
              const s = getPieceStyle(top.player);
              const attr = top.player === 'p1' ? p1Attr : p2Attr;
              const ac = ATTR_COLORS[attr];
              return (
                <div style={{
                  width: '100%', height: '100%',
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 35% 30%, ${s.from}, ${s.to})`,
                  boxShadow: `0 4px 0 ${s.shadow}, 0 6px 16px ${s.shadow}55, inset 0 2px 4px rgba(255,255,255,0.4)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, color: 'white',
                  fontSize: sizeStyle(top.sz).fontSize,
                  position: 'relative',
                  userSelect: 'none',
                }}>
                  {SZ_LBL[top.sz]}

                  {/* 属性アイコン */}
                  {attr !== 'none' && (
                    <motion.span
                      style={{ position: 'absolute', top: -4, right: -4, fontSize: 11, lineHeight: 1 }}
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
                    >
                      {ac.emoji}
                    </motion.span>
                  )}

                  {/* 光シールド */}
                  {top.shield && (
                    <motion.div
                      style={{
                        position: 'absolute', inset: -3,
                        borderRadius: '50%',
                        border: '2.5px solid #FDE68A',
                        pointerEvents: 'none',
                      }}
                      animate={{ opacity: [0.5, 1, 0.5], scale: [0.94, 1.06, 0.94] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  )}

                  {/* スタック数バッジ */}
                  {stack.length > 1 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                      style={{
                        position: 'absolute', bottom: -4, right: -4,
                        background: '#FFD700',
                        border: '2px solid white',
                        borderRadius: '50%',
                        width: 16, height: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 8, fontWeight: 900, color: '#555',
                      }}
                    >
                      {stack.length}
                    </motion.span>
                  )}
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}