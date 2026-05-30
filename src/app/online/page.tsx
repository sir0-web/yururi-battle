'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnlineGame } from '@/hooks/useOnlineGame';
import { Attribute, ATTRIBUTE_INFO } from '@/types/game';
import Board from '@/components/game/Board';
import PlayerPanel from '@/components/game/PlayerPanel';
import ResultOverlay from '@/components/game/ResultOverlay';

const ATTRS: Attribute[] = ['fire', 'water', 'thunder', 'dark', 'light', 'none'];

function OnlinePageInner() {
  const router = useRouter();
  const [nameInput, setNameInput] = useState('');
  const {
    phase, myName, myRole, myPlayer, game, myAttr, opponentName,
    error, moves, isMyTurn,
    startMatching, confirmAttr, placePiece, setMyAttr,
  } = useOnlineGame();

  // ロビー：名前入力
  if (phase === 'lobby') return (
    <div className="min-h-screen bg-[#FFF9F0] flex flex-col items-center justify-center px-4">
      <motion.div
        className="w-full max-w-sm flex flex-col gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center">
          <motion.div
            className="text-7xl mb-3"
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >🌐</motion.div>
          <div className="font-black text-2xl text-purple-600" style={{ fontFamily: "'Fredoka One',cursive" }}>
            オンライン対戦
          </div>
          <div className="text-sm text-gray-400 font-bold mt-1">世界中のプレイヤーとバトル！</div>
        </div>

        {error && (
          <motion.div
            className="bg-red-100 text-red-600 font-bold text-sm px-4 py-3 rounded-2xl text-center"
            initial={{ scale: 0.9 }} animate={{ scale: 1 }}
          >
            ⚠️ {error}
          </motion.div>
        )}

        <div className="flex flex-col gap-3">
          <div className="font-black text-sm text-gray-500">ニックネームを入力してね</div>
          <input
            type="text"
            maxLength={10}
            placeholder="例：つよいプレイヤー"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            className="border-2 border-amber-200 rounded-2xl px-5 py-4 font-black text-base outline-none focus:border-purple-400 transition-colors"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          onPointerDown={() => { if (nameInput.trim()) startMatching(nameInput.trim()); }}
          className={`py-4 rounded-full font-black text-lg text-white transition-opacity
            bg-gradient-to-r from-purple-400 to-indigo-400
            shadow-[0_5px_0_#4338CA]
            ${!nameInput.trim() ? 'opacity-40 pointer-events-none' : ''}
          `}
        >
          🎮 対戦相手を探す！
        </motion.button>

        <button
          onPointerDown={() => router.push('/')}
          className="text-sm font-black text-gray-400 text-center"
        >
          ← タイトルへ戻る
        </button>
      </motion.div>
    </div>
  );

  // マッチング待機
  if (phase === 'matching') return (
    <div className="min-h-screen bg-[#FFF9F0] flex flex-col items-center justify-center px-4">
      <motion.div
        className="w-full max-w-sm flex flex-col gap-6 items-center text-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      >
        <motion.div
          className="text-7xl"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >🔍</motion.div>

        <div>
          <div className="font-black text-xl text-gray-700 mb-1">対戦相手を探しています…</div>
          <div className="text-sm text-gray-400 font-bold">{myName} として参加中</div>
        </div>

        {/* ドット */}
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-purple-400"
              animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl px-6 py-4 shadow-md border-2 border-purple-100 text-sm font-bold text-gray-400">
          誰かがオンラインになると<br/>自動でマッチングされるよ！
        </div>

        <button
          onPointerDown={() => router.push('/')}
          className="text-sm font-black text-gray-400"
        >
          ← キャンセル
        </button>
      </motion.div>
    </div>
  );

// 属性選択スキップ
  if (phase === 'selecting') {
    confirmAttr('none');
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
        <div className="font-black text-gray-400">マッチング中...</div>
      </div>
    );
  }
    <div className="min-h-screen bg-[#FFF9F0] flex flex-col items-center justify-center px-4">
      <motion.div
        className="w-full max-w-sm flex flex-col gap-5"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center">
          <motion.div
            className="text-5xl mb-2"
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {myRole === 'host' ? '🐣' : '🐧'}
          </motion.div>
          <div className="font-black text-lg text-gray-700">
            マッチング成功！🎉
          </div>
          <div className="text-sm text-purple-500 font-black mt-1">
            vs {opponentName || '相手'}
          </div>
          <div className="text-sm text-gray-400 font-bold mt-2">属性を選んでね！</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {ATTRS.map(attr => {
            const info = ATTRIBUTE_INFO[attr];
            const isSel = myAttr === attr;
            return (
              <motion.button
                key={attr}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onPointerDown={() => setMyAttr(attr)}
                className={`relative rounded-2xl p-3 text-left border-2 transition-colors
                  ${isSel
                    ? 'border-yellow-400 bg-yellow-50 shadow-[0_4px_0_#DCC89A]'
                    : 'border-amber-100 bg-white shadow-md'
                  }`}
              >
                {isSel && (
                  <motion.div
                    className="absolute top-2 right-2 text-yellow-400 font-black text-sm"
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                  >✓</motion.div>
                )}
                <div className="text-3xl mb-1">{info.emoji}</div>
                <div className="font-black text-sm text-gray-700">{info.label}属性</div>
                <div className="text-xs text-gray-400 mt-0.5 leading-tight">{info.desc}</div>
                <div className={`mt-2 h-1 rounded-full bg-gradient-to-r ${info.color} opacity-70`} />
              </motion.button>
            );
          })}
        </div>

        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onPointerDown={() => confirmAttr(myAttr)}
          className={`w-full py-4 rounded-full font-black text-lg text-white bg-gradient-to-r ${ATTRIBUTE_INFO[myAttr].color} shadow-[0_5px_0_rgba(0,0,0,0.15)]`}
        >
          {ATTRIBUTE_INFO[myAttr].emoji} {ATTRIBUTE_INFO[myAttr].label}属性で決定！
        </motion.button>

        <div className="text-center text-xs text-gray-400 font-bold">
          相手の属性選択を待っています…
        </div>
      </motion.div>
    </div>
  

  // ゲーム画面
  if ((phase === 'playing' || phase === 'finished') && game) {
    const [selPiece, setSelPiece] = useState<{idx: number, sz: 'L'|'M'|'S'} | null>(null);
    const turnColor = game.cur === 'p1' ? 'bg-red-100 text-red-700' : 'bg-teal-100 text-teal-700';
    const turnName = game.cur === myPlayer ? 'あなた' : opponentName || '相手';

    const onSelectPiece = (player: 'p1'|'p2', idx: number) => {
      if (!isMyTurn) return;
      if (player !== myPlayer) return;
      const piece = game.pieces[player][idx];
      if (piece.used) return;
      setSelPiece(prev => prev?.idx === idx ? null : { idx, sz: piece.sz });
    };

    const onCell = (ci: number) => {
      if (!isMyTurn || !selPiece || game.winner || game.draw) return;
      placePiece(game, selPiece.idx, ci);
      setSelPiece(null);
    };

    const sel = selPiece ? { player: myPlayer, idx: selPiece.idx, sz: selPiece.sz } : null;

    return (
      <div className="min-h-screen bg-[#FFF9F0] flex flex-col">
        <div className="max-w-md w-full mx-auto px-3 py-3 flex flex-col gap-3">

          <div className="flex items-center justify-between gap-2">
            <span className="font-black text-purple-500 text-lg" style={{ fontFamily: "'Fredoka One',cursive" }}>
              🌐 オンライン
            </span>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-black text-sm ${turnColor}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${game.cur === 'p1' ? 'bg-red-400' : 'bg-teal-400'}`} />
              {game.winner || game.draw ? '🏆 終了！' : `${turnName}のターン`}
            </div>
            <button
              onPointerDown={() => { if (confirm('タイトルに戻りますか？')) router.push('/'); }}
              className="text-sm font-black px-3 py-1.5 rounded-full border-2 border-amber-200 bg-white shadow-[0_3px_0_#DCC89A]"
            >✕</button>
          </div>

          {/* 属性バッジ */}
          <div className="flex gap-2 justify-center">
            {(['p1', 'p2'] as const).map(p => {
              const attr = game.attributes[p];
              const info = ATTRIBUTE_INFO[attr];
              const isMe = p === myPlayer;
              return (
                <div key={p} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black text-white bg-gradient-to-r ${info.color} ${isMe ? 'ring-2 ring-yellow-400' : ''}`}>
                  {info.emoji} {isMe ? myName : opponentName}:{info.label}
                </div>
              );
            })}
          </div>

          {/* ターンメッセージ */}
          <motion.div
            className={`text-center text-sm font-black py-2 px-4 rounded-full shadow-md min-h-9 flex items-center justify-center gap-1
              ${isMyTurn ? 'bg-yellow-100 text-yellow-700' : 'bg-white text-gray-400'}`}
            animate={isMyTurn ? { scale: [1, 1.03, 1] } : {}}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            {isMyTurn
              ? (sel ? `「${sel.sz === 'L' ? '大' : sel.sz === 'M' ? '中' : '小'}」を置く場所を選んでね！` : '👆 コマを選んでね！')
              : '⏳ 相手のターン…'
            }
          </motion.div>

          <div className="grid grid-cols-2 gap-2">
            <PlayerPanel
              player="p1"
              name={myPlayer === 'p1' ? `${myName} 👈` : opponentName}
              pieces={game.pieces.p1}
              sel={myPlayer === 'p1' ? sel : null}
              isActive={game.cur === 'p1' && !game.winner && !game.draw}
              isCpuTurn={game.cur !== myPlayer}
              onSelect={onSelectPiece}
            />
            <PlayerPanel
              player="p2"
              name={myPlayer === 'p2' ? `${myName} 👈` : opponentName}
              pieces={game.pieces.p2}
              sel={myPlayer === 'p2' ? sel : null}
              isActive={game.cur === 'p2' && !game.winner && !game.draw}
              isCpuTurn={game.cur !== myPlayer}
              onSelect={onSelectPiece}
            />
          </div>

          <Board
            board={game.board}
            sel={sel}
            winLine={game.winLine}
            canPlaceCheck={(sz, ci) => {
              if (!isMyTurn || !sel) return false;
              const stack = game.board[ci];
              if (!stack.length) return true;
              const top = stack[stack.length - 1];
              return ['L','M','S'].indexOf(sz) < ['L','M','S'].indexOf(top.sz);
            }}
            onCell={onCell}
            p1Attr={game.attributes.p1}
            p2Attr={game.attributes.p2}
          />

          <div className="text-xs font-bold text-gray-400 text-center">
            🔢 手数: {moves}
          </div>
        </div>

        {(game.winner || game.draw) && (
          <ResultOverlay
            winner={game.winner} draw={game.draw} mode="local"
            onRematch={() => router.push('/online')}
            onTitle={() => router.push('/')}
          />
        )}
      </div>
    );
  }

  return null;
}

export default function OnlinePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center font-black text-gray-400">読み込み中...</div>}>
      <OnlinePageInner />
    </Suspense>
  );
}