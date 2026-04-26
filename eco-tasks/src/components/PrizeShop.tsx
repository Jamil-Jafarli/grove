import { PRIZES } from '../data/prizes';

interface Props {
  monthlyDays: number;
  redeemedPrizes: string[];
  onRedeem: (prizeId: string) => void;
}

export default function PrizeShop({ monthlyDays, redeemedPrizes, onRedeem }: Props) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🎁</span>
        <h2 className="text-xl font-bold text-gray-800">Mükafat Mağazası</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Ayda ardıcıl gün tapşırıqları yerinə yetirərək mükafatları qazanın
      </p>

      <div className="grid gap-3">
        {PRIZES.map((prize) => {
          const unlocked = monthlyDays >= prize.requiredDays;
          const redeemed = redeemedPrizes.includes(prize.id);
          const remaining = Math.max(0, prize.requiredDays - monthlyDays);

          return (
            <div
              key={prize.id}
              className={`rounded-2xl border-2 p-4 transition-all ${
                redeemed
                  ? 'border-green-300 bg-green-50'
                  : unlocked
                  ? 'border-purple-300 bg-purple-50 shadow-sm'
                  : 'border-gray-100 bg-gray-50 opacity-70'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${prize.color} flex items-center justify-center text-2xl shadow-sm ${!unlocked ? 'grayscale opacity-50' : ''}`}>
                  {prize.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800">{prize.title}</span>
                    {redeemed && <span className="text-xs bg-green-200 text-green-700 px-2 py-0.5 rounded-full">Tələb edildi</span>}
                    {unlocked && !redeemed && <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full">Hazır!</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{prize.description}</p>
                  <div className="mt-1.5">
                    {/* mini progress */}
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full bg-gradient-to-r ${prize.color} transition-all duration-500`}
                        style={{ width: `${Math.min(100, (monthlyDays / prize.requiredDays) * 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {redeemed ? '✓ Tamamlandı' : unlocked ? `${prize.requiredDays} gün — açıldı!` : `${remaining} gün qalıb`}
                    </div>
                  </div>
                </div>

                {unlocked && !redeemed && (
                  <button
                    onClick={() => onRedeem(prize.id)}
                    className="shrink-0 px-3 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white text-xs font-semibold rounded-xl hover:opacity-90 transition shadow"
                  >
                    Tələb et
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
