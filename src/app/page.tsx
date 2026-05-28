'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Attribute, ATTRIBUTE_INFO } from '@/types/game';

const FLOATING_EMOJIS = ['🎮','⚡','🔥','💧','🌟','🌑','🎲','✨','🎯','💫'];

export default function TitlePage() {
  const router = useRouter();
  const [diff, setDiff] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [showHowto, setShowHowto] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (showHowto) return (
    <motion.div
      className="min-h-screen bg-[#FFF9F0] flex flex-col"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
    >
      <div className="max-w-md w-full mx-auto px-4 py-4 flex flex-col gap-4 pb-12">
        <div className="flex items-center gap-3 pt-1">
          <button onPointerDown={() => setShowHowto(false)}
            className="text-sm font-black px-3 py-1.5 rounded-full border-2 border-amber-200 bg-white shadow-[0_3px_0_#DCC89A] active:shadow-none active:translate-y-0.5 transition-all">
            ← 戻る
          </button>
          <span className="font-black text-2xl text-red-600" style={{fontFamily:"'Fredoka One',cursive"}}>📖 遊び方</span>
        </div>
        {[
          { color: 'border-teal-400', title: '🎯 勝利条件', titleColor: 'text-teal-700', body: '縦・横・斜めに自分のコマを3つ並べると勝ち！判定は一番上に見えているコマで行うよ。' },
          { color: 'border-red-400', title: '🪆 コマのサイズ', titleColor: 'text-red-600', body: '各プレイヤーは大×2、中×3、小×3の合計8個を持つ。' },
          { color: 'border-teal-400', title: '🍽️ 上書きルール', titleColor: 'text-teal-700', body: 'より大きいコマで小さいコマを上書きできる！小→中・大、中→大はOK。同サイズや逆方向はNG。' },
          { color: 'border-red-400', title: '👻 隠れコマ', titleColor: 'text-red-600', body: '上書きされたコマは半透明で見える。上のコマが移動すれば再表示！' },
          { color: 'border-teal-400', title: '💡 攻略のヒント', titleColor: 'text-teal-700', body: '大コマは強力だが数が少ない！中央を取ると有利。相手の隠れコマを覚えておこう。' },
        ].map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`bg-white rounded-2xl p-4 shadow-md border-l-4 ${c.color}`}
          >
            <h3 className={`font-black text-sm mb-2 ${c.titleColor}`}>{c.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{c.body}</p>
          </motion.div>
        ))}
        <button onPointerDown={() => setShowHowto(false)}
          className="bg-gradient-to-r from-red-400 to-orange-400 text-white font-black text-lg py-4 rounded-full shadow-[0_6px_0_#CC3300] active:shadow-[0_2px_0_#CC3300] active:translate-y-1 transition-all">
          わかった！
        </button>
      </div>
    </motion.div>
  );

  if (showSettings) return (
    <motion.div
      className="min-h-screen bg-[#FFF9F0] flex flex-col"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="max-w-md w-full mx-auto px-4 py-4 flex flex-col gap-4 pb-12">
        <div className="flex items-center gap-3 pt-1">
          <button onPointerDown={() => setShowSettings(false)}
            className="text-sm font-black px-3 py-1.5 rounded-full border-2 border-amber-200 bg-white shadow-[0_3px_0_#DCC89A] active:shadow-none active:translate-y-0.5 transition-all">
            ← 戻る
          </button>
          <span className="font-black text-2xl text-teal-600" style={{fontFamily:"'Fredoka One',cursive"}}>⚙️ 設定</span>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <h3 className="font-black text-sm text-teal-600 mb-3 border-b-2 border-dashed border-amber-200 pb-2">🤖 CPU難易度</h3>
          <div className="flex gap-2">
            {(['easy','normal','hard'] as const).map((d, i) => (
              <motion.button
                key={d}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onPointerDown={() => setDiff(d)}
                className={`flex-1 py-2 rounded-full font-black text-sm transition-all border-2
                  ${diff === d ? 'bg-teal-400 text-white border-teal-400 shadow-[0_3px_0_#1A9991]' : 'bg-white text-gray-500 border-amber-200'}`}
              >
                {['やさしい','ふつう','むずかしい'][i]}
              </motion.button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <h3 className="font-black text-sm text-teal-600 mb-3 border-b-2 border-dashed border-amber-200 pb-2">🌈 属性プレビュー</h3>
          <div className="grid grid-cols-3 gap-2">
            {(['fire','water','thunder','dark','light','none'] as const).map(attr => {
              const info = ATTRIBUTE_INFO[attr];
              return (
                <div key={attr} className={`rounded-xl p-2 text-center bg-gradient-to-br ${info.color} text-white`}>
                  <div className="text-xl">{info.emoji || '⬜'}</div>
                  <div className="text-xs font-black">{info.label}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <h3 className="font-black text-sm text-teal-600 mb-2 border-b-2 border-dashed border-amber-200 pb-2">ℹ️ バージョン</h3>
          <p className="text-sm text-gray-400">ゆるぽりバトル v0.3.0<br/>Phase 1+2+3 実装済み</p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{background:'linear-gradient(160deg,#FFE5D0 0%,#FFF0E8 40%,#E8F8F7 100%)'}}>

      {/* 背景ブロブ */}
      <motion.div
        className="absolute w-80 h-80 rounded-full opacity-30 blur-3xl"
        style={{background:'#FF6B6B', top:-80, left:-80}}
        animate={{scale:[1,1.15,1]}}
        transition={{duration:4,repeat:Infinity}}
      />
      <motion.div
        className="absolute w-64 h-64 rounded-full opacity-30 blur-3xl"
        style={{background:'#4ECDC4', bottom:-60, right:-60}}
        animate={{scale:[1,1.15,1]}}
        transition={{duration:5,repeat:Infinity,delay:1}}
      />
      <motion.div
        className="absolute w-48 h-48 rounded-full opacity-20 blur-3xl"
        style={{background:'#FFD700', top:'40%', left:'30%'}}
        animate={{scale:[1,1.2,1]}}
        transition={{duration:3.5,repeat:Infinity,delay:0.5}}
      />

      {/* フローティング絵文字 */}
      {FLOATING_EMOJIS.map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl pointer-events-none select-none"
          style={{
            left: `${8 + (i * 9) % 85}%`,
            top: `${5 + (i * 13) % 85}%`,
          }}
          animate={{
            y: [-8, 8, -8],
            rotate: [-10, 10, -10],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 3 + i * 0.4,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* メインコンテンツ */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-6 px-5 w-full max-w-xs"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {/* マスコット */}
        <motion.div
          className="text-8xl"
          animate={{ y: [-8, 8, -8], rotate: [-5, 5, -5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          🐣
        </motion.div>

        {/* タイトル */}
        <motion.div
          className="text-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
        >
          <div
            className="font-black leading-tight"
            style={{
              fontFamily:"'Fredoka One',cursive",
              fontSize: 'clamp(36px,10vw,60px)',
              background:'linear-gradient(135deg,#FF6B6B 0%,#FF9A3C 40%,#1A9991 100%)',
              WebkitBackgroundClip:'text',
              WebkitTextFillColor:'transparent',
              filter:'drop-shadow(3px 3px 0 rgba(0,0,0,0.1))',
            }}
          >
            ゆるぽり<br/>バトル
          </div>
          <motion.div
            className="mt-2 text-xs font-bold text-gray-400 bg-white px-4 py-1.5 rounded-full border-2 border-amber-200 inline-block shadow-sm"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎮 ストラテジーパズル
          </motion.div>
        </motion.div>

        {/* ボタン */}
        <div className="flex flex-col gap-3 w-full">
          {[
            { label: '👥 2人でプレイ', style: 'from-red-400 to-orange-400', shadow: '#CC3300', onClick: () => router.push('/game?mode=local'), delay: 0.2 },
            { label: '🤖 CPU対戦',     style: 'from-teal-400 to-cyan-400',  shadow: '#1A9991', onClick: () => router.push(`/game?mode=cpu&diff=${diff}`), delay: 0.28 },
          ].map((btn, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: btn.delay, type: 'spring', stiffness: 300 }}
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.96, y: 2 }}
              onPointerDown={btn.onClick}
              className={`bg-gradient-to-r ${btn.style} text-white font-black text-lg py-4 rounded-full`}
              style={{ boxShadow: `0 6px 0 ${btn.shadow}, 0 8px 20px ${btn.shadow}55` }}
            >
              {btn.label}
            </motion.button>
          ))}

          {[
            { label: '📖 遊び方', onClick: () => setShowHowto(true), delay: 0.36 },
            { label: '⚙️ 設定',   onClick: () => setShowSettings(true), delay: 0.42 },
          ].map((btn, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: btn.delay }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onPointerDown={btn.onClick}
              className="bg-white text-gray-600 font-black text-sm py-3 rounded-full border-2 border-amber-200 shadow-[0_4px_0_#DCC89A]"
            >
              {btn.label}
            </motion.button>
          ))}
        </div>

        {/* バージョン */}
        <motion.div
          className="text-xs text-gray-300 font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          v0.3.0
        </motion.div>
      </motion.div>
    </div>
  );
}