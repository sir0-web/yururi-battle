'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GameMode } from '@/types/game';
import { useGameState } from '@/hooks/useGameState';
import Board from '@/components/game/Board';
import PlayerPanel from '@/components/game/PlayerPanel';
import ResultOverlay from '@/components/game/ResultOverlay';

function GamePageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const mode = (params.get('mode') ?? 'local') as GameMode;
  const diff = params.get('diff') ?? 'normal';

  const { game, sel, busy, moves, reset, selectPiece, placePiece, triggerCpu, canPlaceCheck } = useGameState(mode, diff);
  const prevCur = useRef(game.cur);

  useEffect(() => {
    if (prevCur.current !== game.cur) {
      prevCur.current = game.cur;
    }
    if (!game.winner && !game.draw && mode === 'cpu' && game.cur === 'p2') {
      triggerCpu(game);
    }
  }, [game.cur, game.winner, game.draw]);

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
  else if (sel) msg = `「${sel.sz === 'L' ? '大' : sel.sz === 'M' ? '中' : '小'}」を置く場所を選んでね！`;

  return (
    <div className="min-h-screen bg-[#FFF9F0] flex flex-col">
      <div className="max-w-md w-full mx-auto px-3 py-3 flex flex-col gap-3">

        <div className="flex items-center justify-between gap-2">
          <span className="font-black text-red-400 text-lg" style={{fontFamily:"'Fredoka One',cursive"}}>
            🎮 バトル
          </span>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-black text-sm ${turnColor}`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${game.cur === 'p1' ? 'bg-red-400' : 'bg-teal-400'}`} />
            {game.winner || game.draw ? '🏆 終了！' : `${turnName}のターン`}
          </div>
          <button
            onPointerDown={() => { if (confirm('タイトルに戻りますか？')) router.push('/'); }}
            className="text-sm font-black px-3 py-1.5 rounded-full border-2 border-amber-200 bg-white shadow-[0_3px_0_#DCC89A] active:shadow-none active:translate-y-0.5 transition-all"
          >✕</button>
        </div>

        {isCpuTurn && !game.winner && !game.draw && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-100 rounded-full w-fit text-teal-700 font-black text-xs">
            <span>CPU思考中</span>
            {[0,1,2].map(i => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{animationDelay:`${i*0.15}s`}} />
            ))}
          </div>
        )}

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

        <div className="text-center text-sm font-black py-2 px-4 bg-white rounded-full shadow-md min-h-9 flex items-center justify-center gap-1">
          <span>👆</span><span>{msg}</span>
        </div>

        <Board
          board={game.board} sel={sel}
          winLine={game.winLine}
          canPlaceCheck={canPlaceCheck}
          onCell={onCell}
        />

        <div className="flex items-center justify-between text-xs font-bold text-gray-400">
          <span>🔢 手数: {moves}</span>
          <button
            onPointerDown={() => { if (confirm('リセットしますか？')) reset(); }}
            className="text-xs font-black px-3 py-1.5 rounded-full border-2 border-amber-200 bg-white shadow-[0_2px_0_#DCC89A] active:shadow-none active:translate-y-0.5 transition-all"
          >🔄 リセット</button>
        </div>
      </div>

      {(game.winner || game.draw) && (
        <ResultOverlay
          winner={game.winner} draw={game.draw} mode={mode}
          onRematch={reset}
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