'use client';

import { GameMode, Player } from '@/types/game';

interface Props {
  winner: Player | null;
  draw: boolean;
  mode: GameMode;
  onRematch: () => void;
  onTitle: () => void;
}

export default function ResultOverlay({ winner, draw, mode, onRematch, onTitle }: Props) {
  const emoji = draw ? '🤝' : winner === 'p1' ? '🎉' : mode === 'cpu' ? '🤖' : '🎉';
  const title = draw ? '引き分け！' : winner === 'p1' ? 'P1の勝利！' : mode === 'cpu' ? 'CPUの勝ち…' : 'P2の勝利！';
  const sub = draw ? 'お互いすごかった！' : winner === 'p1'
    ? (mode === 'cpu' ? 'CPUに勝った！すごい！' : 'おめでとう！')
    : (mode === 'cpu' ? 'またチャレンジ！' : 'おめでとう！');
  const titleColor = winner === 'p1' ? 'text-red-600' : winner === 'p2' ? 'text-teal-600' : 'text-gray-700';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl px-8 py-9 text-center max-w-xs w-[90%] shadow-2xl animate-bounce-in">
        <div className="text-7xl mb-2 animate-wiggle inline-block">{emoji}</div>
        <div className={`font-black text-3xl mb-1 ${titleColor}`} style={{fontFamily:"'Fredoka One', cursive"}}>{title}</div>
        <div className="text-gray-500 font-bold text-base mb-6">{sub}</div>
        <div className="flex flex-col gap-3">
          <button
            onPointerDown={onRematch}
            className="bg-gradient-to-r from-red-400 to-orange-400 text-white font-black text-lg py-3 px-6 rounded-full shadow-[0_5px_0_#CC3300] active:shadow-[0_2px_0_#CC3300] active:translate-y-1 transition-all"
          >
            🔄 もう一度！
          </button>
          <button
            onPointerDown={onTitle}
            className="bg-white text-gray-700 font-black text-sm py-2 px-5 rounded-full border-2 border-amber-200 shadow-[0_3px_0_#DCC89A] active:shadow-[0_1px_0_#DCC89A] active:translate-y-0.5 transition-all"
          >
            🏠 タイトルへ
          </button>
        </div>
      </div>
    </div>
  );
}