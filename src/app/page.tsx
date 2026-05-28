'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function TitlePage() {
  const router = useRouter();
  const [diff, setDiff] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [showHowto, setShowHowto] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (showHowto) return (
    <div className="min-h-screen bg-[#FFF9F0] flex flex-col">
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
          <div key={i} className={`bg-white rounded-2xl p-4 shadow-md border-l-4 ${c.color}`}>
            <h3 className={`font-black text-sm mb-2 ${c.titleColor}`}>{c.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{c.body}</p>
          </div>
        ))}
        <button onPointerDown={() => setShowHowto(false)}
          className="bg-gradient-to-r from-red-400 to-orange-400 text-white font-black text-lg py-4 rounded-full shadow-[0_6px_0_#CC3300] active:shadow-[0_2px_0_#CC3300] active:translate-y-1 transition-all">
          わかった！
        </button>
      </div>
    </div>
  );

  if (showSettings) return (
    <div className="min-h-screen bg-[#FFF9F0] flex flex-col">
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
            {(['easy','normal','hard'] as const).map(d => (
              <button key={d} onPointerDown={() => setDiff(d)}
                className={`flex-1 py-2 rounded-full font-black text-sm transition-all border-2
                  ${diff === d ? 'bg-teal-400 text-white border-teal-400 shadow-[0_3px_0_#1A9991]' : 'bg-white text-gray-500 border-amber-200'}`}>
                {d === 'easy' ? 'やさしい' : d === 'normal' ? 'ふつう' : 'むずかしい'}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <h3 className="font-black text-sm text-teal-600 mb-2 border-b-2 border-dashed border-amber-200 pb-2">ℹ️ バージョン</h3>
          <p className="text-sm text-gray-400">ゆるぽりバトル v0.2.0<br/>Phase 1 + 2 実装済み</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{background:'linear-gradient(160deg,#FFE5D0 0%,#FFF0E8 40%,#E8F8F7 100%)'}}>
      <div className="absolute w-72 h-72 rounded-full bg-red-200 opacity-40 blur-3xl -top-20 -left-20 animate-pulse" />
      <div className="absolute w-60 h-60 rounded-full bg-teal-200 opacity-40 blur-3xl -bottom-16 -right-16 animate-pulse" style={{animationDelay:'1s'}} />

      <div className="relative z-10 flex flex-col items-center gap-6 px-5 w-full max-w-xs">
        <div className="text-7xl animate-bounce">🐣</div>
        <div className="text-center">
          <div className="font-black text-6xl leading-tight"
            style={{fontFamily:"'Fredoka One',cursive", background:'linear-gradient(135deg,#FF6B6B,#FF9A3C,#1A9991)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
            ゆるぽり<br/>バトル
          </div>
          <div className="mt-2 text-xs font-bold text-gray-400 bg-white px-4 py-1 rounded-full border-2 border-amber-200 inline-block">
            🎮 ストラテジーパズル
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button onPointerDown={() => router.push(`/game?mode=local`)}
            className="bg-gradient-to-r from-red-400 to-orange-400 text-white font-black text-lg py-4 rounded-full shadow-[0_6px_0_#CC3300] active:shadow-[0_2px_0_#CC3300] active:translate-y-1 transition-all hover:-translate-y-0.5">
            👥 2人でプレイ
          </button>
          <button onPointerDown={() => router.push(`/game?mode=cpu&diff=${diff}`)}
            className="bg-gradient-to-r from-teal-400 to-cyan-400 text-white font-black text-lg py-4 rounded-full shadow-[0_6px_0_#1A9991] active:shadow-[0_2px_0_#1A9991] active:translate-y-1 transition-all hover:-translate-y-0.5">
            🤖 CPU対戦
          </button>
          <button onPointerDown={() => setShowHowto(true)}
            className="bg-white text-gray-600 font-black text-sm py-3 rounded-full border-2 border-amber-200 shadow-[0_4px_0_#DCC89A] active:shadow-[0_1px_0_#DCC89A] active:translate-y-0.5 transition-all">
            📖 遊び方
          </button>
          <button onPointerDown={() => setShowSettings(true)}
            className="bg-white text-gray-600 font-black text-sm py-3 rounded-full border-2 border-amber-200 shadow-[0_4px_0_#DCC89A] active:shadow-[0_1px_0_#DCC89A] active:translate-y-0.5 transition-all">
            ⚙️ 設定
          </button>
        </div>
      </div>
    </div>
  );
}