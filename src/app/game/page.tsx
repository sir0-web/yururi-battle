'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Attribute, GameMode, ATTRIBUTE_INFO } from '@/types/game';
import { useGameState } from '@/hooks/useGameState';
import Board from '@/components/game/Board';
import PlayerPanel from '@/components/game/PlayerPanel';
import ResultOverlay from '@/components/game/ResultOverlay';
import AttributeSelect from '@/components/game/AttributeSelect';
import { motion, AnimatePresence } from 'framer-motion';

function GamePageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const mode = (params.get('mode') ?? 'local') as GameMode;
  const diff = params.get('diff') ?? 'normal';

  const [phase, setPhase] = useState<'attr-p1' | 'attr-p2' | 'game'>('game');
  const [p1Attr, setP1Attr] = useState<Attribute>('none');
  const [p2Attr, setP2Attr] = useState<Attribute>('none');

  const { game, sel, busy, moves, reset, selectPiece, placePiece, triggerCpu, canPlaceCheck } = useGameState(mode, diff);

  useEffect(() => {
    if (!game.winner && !game.draw && mode === 'cpu' && game.cur === 'p2') {
      triggerCpu(game);
    }
  }, [game.cur, game.winner, game.draw]);

const startGame = () => {
    const attrs = { p1: 'none' as Attribute, p2: 'none' as Attribute };
    reset(attrs);
    setPhase('game');
  };

  // 初回自動スタート
  useEffect(() => {
    startGame();
  }, []);

  const onCell = (ci: number) => {
    if (!sel || busy || game.winner || game.draw) return;
    if (mode === 'cpu' && game.cur === 'p2') return;
    placePiece(ci);
  };

  const isCpuTurn = mode === 'cpu' && game.cur === 'p2';
  const p2Name = mode === 'cpu' ? 'CPU 🤖' : 'プレイヤー2';
  const turnColor = game.cur === 'p1' ? 'bg-red-100 text-red-700' : 'bg-teal-100 text-teal-700';
  const turnName = game.cur === 'p1' ? 'P1' : (mode === 'cpu' ? 'CPU' : 'P2');

  let msg = 'コマを選んでね！';
  if (game.winner || game.draw) msg = '結果を確認！';
  else if (isCpuTurn) msg = 'CPUが考えています…';
  else if (game.extraTurn) msg = '⚡ もう1手！';
  else if (sel) msg = `「${sel.sz === 'L' ? '大' : sel.sz === 'M' ? '中' : '小'}」を置く場所を選んでね！`;

  // 属性選択フェーズ
  if (phase === 'attr-p1') {
    return (
      <AttributeSelect
        player="p1"
        selected={p1Attr}
        onSelect={setP1Attr}
        onConfirm={() => mode === 'local' ? setPhase('attr-p2') : startGame()}
        isLocal={mode === 'local'}
      />
    );
  }

  if (phase === 'attr-p2' && mode === 'local') {
    return (
      <AttributeSelect
        player="p2"
        selected={p2Attr}
        onSelect={setP2Attr}
        onConfirm={startGame}
        isLocal={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F0] flex flex-col">
      <div className="max-w-md w-full mx-auto px-3 py-3 flex flex-col gap-3">

        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <a href="https://arcana-guild-site.vercel.app/minigame"
              className="text-xs font-black text-gray-400 border border-amber-200 bg-white px-2 py-1 rounded-full shadow-sm">
              🏠 TOP
            </a>
            <span className="font-black text-red-400 text-lg" style={{ fontFamily: "'Fredoka One',cursive" }}>
              🎮 バトル
            </span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-black text-sm ${turnColor}`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${game.cur === 'p1' ? 'bg-red-400' : 'bg-teal-400'}`} />
            {game.winner || game.draw ? '🏆 終了！' : `${turnName}のターン`}
          </div>
          <button
            onPointerDown={() => { if (confirm('タイトルに戻りますか？')) router.push('/'); }}
            className="text-sm font-black px-3 py-1.5 rounded-full border-2 border-amber-200 bg-white shadow-[0_3px_0_#DCC89A] active:shadow-none active:translate-y-0.5 transition-all"
          >✕</button>
        </div>

        {/* 属性バッジ */}
        <div className="flex gap-2 justify-center">
          {(['p1','p2'] as const).map(p => {
            const attr = game.attributes[p];
            const info = ATTRIBUTE_INFO[attr];
            return (
              <motion.div
                key={p}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black text-white bg-gradient-to-r ${info.color}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                {info.emoji} {p === 'p1' ? 'P1' : (mode === 'cpu' ? 'CPU' : 'P2')}:{info.label}
              </motion.div>
            );
          })}
        </div>

        {/* エフェクト通知 */}
        <AnimatePresence>
          {game.lastEffect?.type === 'explosion' && (
            <motion.div
              className="text-center text-sm font-black py-1.5 px-4 bg-orange-100 text-orange-600 rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              🔥 爆発！隣接コマにダメージ！
            </motion.div>
          )}
          {game.lastEffect?.type === 'extra_turn' && (
            <motion.div
              className="text-center text-sm font-black py-1.5 px-4 bg-yellow-100 text-yellow-600 rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              ⚡ 雷の力！もう1手追加！
            </motion.div>
          )}
          {game.lastEffect?.type === 'shield_break' && (
            <motion.div
              className="text-center text-sm font-black py-1.5 px-4 bg-lime-100 text-lime-600 rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              🌟 シールド破壊！
            </motion.div>
          )}
        </AnimatePresence>

        {/* CPU thinking */}
        {isCpuTurn && !game.winner && !game.draw && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-100 rounded-full w-fit text-teal-700 font-black text-xs">
            <span>CPU思考中</span>
            {[0, 1, 2].map(i => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}

        {/* Player panels */}
        <div className="grid grid-cols-2 gap-2">
          <PlayerPanel
            player="p1" name="プレイヤー1"
            pieces={game.pieces.p1} sel={sel}
            isActive={game.cur === 'p1' && !game.winner && !game.draw}
            isCpuTurn={isCpuTurn}
            onSelect={selectPiece}
          />
          <PlayerPanel
            player="p2" name={p2Name}
            pieces={game.pieces.p2} sel={sel}
            isActive={game.cur === 'p2' && !game.winner && !game.draw}
            isCpuTurn={isCpuTurn}
            onSelect={selectPiece}
          />
        </div>

        {/* Message */}
        <div className="text-center text-sm font-black py-2 px-4 bg-white rounded-full shadow-md min-h-9 flex items-center justify-center gap-1">
          <span>👆</span><span>{msg}</span>
        </div>

        {/* Board */}
        <Board
          board={game.board}
          sel={sel}
          winLine={game.winLine}
          canPlaceCheck={canPlaceCheck}
          onCell={onCell}
          p1Attr={game.attributes.p1}
          p2Attr={game.attributes.p2}
        />

        {/* Footer */}
        <div className="flex items-center justify-between text-xs font-bold text-gray-400">
          <span>🔢 手数: {moves}</span>
          <button
            onPointerDown={() => { if (confirm('リセットしますか？')) { startGame(); } }}
            className="text-xs font-black px-3 py-1.5 rounded-full border-2 border-amber-200 bg-white shadow-[0_2px_0_#DCC89A] active:shadow-none active:translate-y-0.5 transition-all"
          >🔄 リセット</button>
        </div>
      </div>

      {(game.winner || game.draw) && (
        <ResultOverlay
          winner={game.winner} draw={game.draw} mode={mode}
         onRematch={() => { startGame(); }}
          onTitle={() => router.push('/')}
        />
      )}
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center font-black text-gray-400">読み込み中...</div>}>
      <GamePageInner />
    </Suspense>
  );
}