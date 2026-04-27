import { useState } from 'react';
import { useEcoStore } from '../store/useEcoStore';

interface WheelPrize {
  id: string;
  icon: string;
  title: string;
  weight: number;
}

const WHEEL_PRIZES: Record<number, WheelPrize[]> = {
  500: [
    { id: 'w1-1', icon: '🌱', title: 'Toxum paketi',          weight: 25 },
    { id: 'w1-2', icon: '🧴', title: 'Eko sabun',             weight: 20 },
    { id: 'w1-3', icon: '♻️', title: 'Geri dönüşüm çantası',  weight: 20 },
    { id: 'w1-4', icon: '💧', title: 'Su filtri tableti',      weight: 15 },
    { id: 'w1-5', icon: '⭐', title: '+200 bonus xal',         weight: 15 },
    { id: 'w1-6', icon: '😔', title: 'Şanssız, yenidən cəhd!', weight: 5  },
  ],
  1000: [
    { id: 'w2-1', icon: '🍶', title: 'Eko su şüşəsi',         weight: 20 },
    { id: 'w2-2', icon: '🛍️', title: 'Eko torba',             weight: 20 },
    { id: 'w2-3', icon: '🌿', title: 'Bitki becərmə dəsti',   weight: 20 },
    { id: 'w2-4', icon: '💡', title: 'LED lampası',            weight: 20 },
    { id: 'w2-5', icon: '⭐', title: '+500 bonus xal',         weight: 15 },
    { id: 'w2-6', icon: '😔', title: 'Şanssız, yenidən cəhd!', weight: 5 },
  ],
  10000: [
    { id: 'w3-1', icon: '🌳', title: 'Adına ağac əkilir',     weight: 20 },
    { id: 'w3-2', icon: '🔋', title: 'Solar powerbank',        weight: 20 },
    { id: 'w3-3', icon: '👕', title: 'Eko hoodie',             weight: 15 },
    { id: 'w3-4', icon: '🎁', title: 'Premium eko dəsti',      weight: 15 },
    { id: 'w3-5', icon: '🏆', title: 'Xüsusi sertifikat',      weight: 20 },
    { id: 'w3-6', icon: '🌻', title: 'Bağ qutusu',             weight: 10 },
  ],
};

function chooseWeightedPrize(prizes: WheelPrize[]): WheelPrize {
  const total = prizes.reduce((s, p) => s + p.weight, 0);
  let rand = Math.random() * total;
  for (const p of prizes) {
    rand -= p.weight;
    if (rand <= 0) return p;
  }
  return prizes[prizes.length - 1];
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

interface WheelCardProps {
  tier: 500 | 1000 | 10000;
  coinBalance: number;
  onSpend: (amount: number) => boolean;
}

function WheelCard({ tier, coinBalance, onSpend }: WheelCardProps) {
  const prizes = WHEEL_PRIZES[tier];
  const [spinning, setSpinning] = useState(false);
  const [displayIdx, setDisplayIdx] = useState<number | null>(null);
  const [winner, setWinner] = useState<WheelPrize | null>(null);
  const [showResult, setShowResult] = useState(false);

  const canSpin = coinBalance >= tier && !spinning;

  const spin = async () => {
    if (!canSpin) return;
    const spent = onSpend(tier);
    if (!spent) return;

    setWinner(null);
    setShowResult(false);
    setSpinning(true);

    const result = chooseWeightedPrize(prizes);
    const resultIdx = prizes.findIndex(p => p.id === result.id);

    // Spin through prizes with slowing animation
    const totalSteps = prizes.length * 4 + resultIdx;
    for (let i = 0; i < totalSteps; i++) {
      const progress = i / totalSteps;
      const ms = progress < 0.5 ? 60 : progress < 0.8 ? 100 : 200;
      await delay(ms);
      setDisplayIdx(i % prizes.length);
    }

    setDisplayIdx(resultIdx);
    setWinner(result);
    setSpinning(false);
    setShowResult(true);
  };

  const tierColor = tier === 500
    ? 'from-green-400 to-emerald-500'
    : tier === 1000
    ? 'from-blue-400 to-indigo-500'
    : 'from-yellow-400 to-orange-500';

  const tierLabel = tier === 500 ? 'Yaşıl Çarx' : tier === 1000 ? 'Mavi Çarx' : 'Qızıl Çarx';

  const current = displayIdx !== null ? prizes[displayIdx] : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${tierColor} p-3 flex items-center justify-between`}>
        <div>
          <div className="text-white font-bold text-base">{tierLabel}</div>
          <div className="text-white/80 text-xs">{tier.toLocaleString()} 🪙 xərclənir</div>
        </div>
        <div className="text-3xl">🎡</div>
      </div>

      {/* Display */}
      <div className="p-4">
        <div className={`h-24 rounded-2xl flex flex-col items-center justify-center border-2 mb-4 transition-all ${
          spinning ? 'border-yellow-400 bg-yellow-50 animate-pulse' : showResult && winner ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'
        }`}>
          {spinning && current ? (
            <>
              <span className="text-4xl">{current.icon}</span>
              <span className="text-xs text-gray-500 mt-1">{current.title}</span>
            </>
          ) : showResult && winner ? (
            <>
              <span className="text-4xl">{winner.icon}</span>
              <span className="text-sm font-bold text-green-700 mt-1">{winner.title}</span>
              <span className="text-xs text-green-500">Təbrik!</span>
            </>
          ) : (
            <span className="text-4xl">🎯</span>
          )}
        </div>

        {/* Prize list preview */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {prizes.map((p, i) => (
            <div
              key={p.id}
              className={`rounded-xl p-2 text-center border transition-all ${
                displayIdx === i && spinning ? 'border-yellow-400 bg-yellow-50 scale-105' :
                winner?.id === p.id && showResult ? 'border-green-400 bg-green-50' :
                'border-gray-100 bg-gray-50'
              }`}
            >
              <div className="text-xl">{p.icon}</div>
              <div className="text-[10px] text-gray-500 leading-tight mt-0.5">{p.title}</div>
            </div>
          ))}
        </div>

        {/* Spin button */}
        <button
          onClick={spin}
          disabled={!canSpin}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
            canSpin
              ? `bg-gradient-to-r ${tierColor} text-white shadow-md hover:shadow-lg active:scale-95`
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {spinning ? 'Çevrilir...' : coinBalance < tier ? `${(tier - coinBalance).toLocaleString()} 🪙 çatmır` : `${tier.toLocaleString()} 🪙 Çevir`}
        </button>
      </div>
    </div>
  );
}

export default function PrizeWheel() {
  const { earnedCoins, spentCoins, spendCoins } = useEcoStore();
  const coinBalance = earnedCoins - spentCoins;

  return (
    <div className="space-y-4">
      {/* Coin balance */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-2xl">🪙</div>
        <div>
          <div className="text-xs text-gray-500">Mövcud balans</div>
          <div className="text-2xl font-bold text-gray-800">{coinBalance.toLocaleString()} <span className="text-sm text-gray-400">coin</span></div>
        </div>
      </div>

      {/* Three wheels */}
      <WheelCard tier={500}   coinBalance={coinBalance} onSpend={spendCoins} />
      <WheelCard tier={1000}  coinBalance={coinBalance} onSpend={spendCoins} />
      <WheelCard tier={10000} coinBalance={coinBalance} onSpend={spendCoins} />
    </div>
  );
}
