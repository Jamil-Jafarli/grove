interface Props {
  streak: number;
  monthlyDays: number;
  completedToday: number;
  totalToday: number;
}

function getStreakIcon(streak: number): string {
  if (streak >= 30) return '🌲';
  if (streak >= 15) return '🌳';
  if (streak >= 8)  return '🌿';
  if (streak >= 4)  return '🪴';
  if (streak >= 1)  return '🌱';
  return '🌰';
}

function getStreakLabel(streak: number): string {
  if (streak >= 30) return 'Əfsanə ağac';
  if (streak >= 15) return 'Kök salmış ağac';
  if (streak >= 8)  return 'Böyüyən ağac';
  if (streak >= 4)  return 'Güclü fidan';
  if (streak >= 1)  return 'Cücərən fidan';
  return 'Toxum';
}

export default function StreakBanner({ streak, monthlyDays, completedToday, totalToday }: Props) {
  const progress = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;
  const icon = getStreakIcon(streak);
  const label = getStreakLabel(streak);
  const allDone = progress === 100;

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-md"
      style={{ background: 'linear-gradient(135deg, #063232 0%, #2B5151 100%)' }}
    >
      {/* Top section */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between">
          {/* Streak */}
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-inner"
              style={{ background: 'rgba(194,223,147,0.15)', border: '1px solid rgba(194,223,147,0.25)' }}
            >
              {icon}
            </div>
            <div>
              <div className="text-4xl font-extrabold text-white tabular leading-none">{streak}</div>
              <div className="text-xs font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>günlük davamiyyət</div>
              <div className="text-xs font-semibold mt-0.5" style={{ color: '#C2DF93' }}>{label}</div>
            </div>
          </div>

          {/* Stats right */}
          <div className="flex flex-col items-end gap-2">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(194,223,147,0.12)', border: '1px solid rgba(194,223,147,0.2)' }}
            >
              <span className="text-base">📅</span>
              <div className="text-right">
                <div className="text-white font-bold text-sm tabular">
                  {monthlyDays}<span className="text-xs font-normal opacity-60">/30</span>
                </div>
                <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.55)' }}>bu ay</div>
              </div>
            </div>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(194,223,147,0.12)', border: '1px solid rgba(194,223,147,0.2)' }}
            >
              <span className="text-base">🌿</span>
              <div className="text-right">
                <div className="text-white font-bold text-sm tabular">
                  {completedToday}<span className="text-xs font-normal opacity-60">/{totalToday}</span>
                </div>
                <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.55)' }}>bu gün</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress section */}
      <div
        className="px-5 py-3"
        style={{ background: 'rgba(0,0,0,0.15)', borderTop: '1px solid rgba(194,223,147,0.1)' }}
      >
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>Günlük irəliləyiş</span>
          <span className="text-xs font-bold" style={{ color: '#C2DF93' }}>{Math.round(progress)}%</span>
        </div>

        <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
          <div
            className={`h-2 rounded-full transition-all duration-700 ${progress > 0 && !allDone ? 'progress-shimmer' : ''}`}
            style={{
              width: `${progress}%`,
              background: allDone ? '#C2DF93' : 'linear-gradient(90deg, #C2DF93, #90c75a)',
            }}
          />
        </div>

        {allDone && (
          <div className="mt-2 text-center text-xs font-bold" style={{ color: '#C2DF93' }}>
            🎉 Bu günün bütün tapşırıqları tamamlandı!
          </div>
        )}
      </div>
    </div>
  );
}
