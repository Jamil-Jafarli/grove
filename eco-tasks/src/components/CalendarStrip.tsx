import type { DayRecord } from '../store/useEcoStore';

interface Props {
  history: DayRecord[];
}

export default function CalendarStrip({ history }: Props) {
  const days: { date: string; label: string; day: string }[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabels = ['B', 'B.E', 'Ç.A', 'Ç', 'C.A', 'C', 'Ş'];
    days.push({
      date: dateStr,
      label: dayLabels[d.getDay()],
      day: String(d.getDate()),
    });
  }

  const todayStr = today.toISOString().slice(0, 10);

  return (
    <div className="enviro-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--e-muted)' }}>
          Son 7 gün
        </h3>
        <span className="text-xs font-medium" style={{ color: 'var(--e-muted)' }}>
          {history.filter(h => h.allDone).length} tamamlandı
        </span>
      </div>
      <div className="flex gap-1.5">
        {days.map(({ date, label, day }) => {
          const rec = history.find((h) => h.date === date);
          const isToday = date === todayStr;
          const allDone = rec?.allDone;
          const partial = rec && !allDone && rec.completedTasks.length > 0;

          return (
            <div key={date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-medium" style={{ color: 'var(--e-muted)' }}>{label}</span>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all"
                style={
                  allDone
                    ? { background: 'var(--e-dark)', color: 'var(--e-green)', border: '2px solid var(--e-dark)' }
                    : partial
                    ? { background: '#FEF3C7', color: '#92400E', border: '2px solid #FDE68A' }
                    : isToday
                    ? { background: 'transparent', color: 'var(--e-dark)', border: '2px solid var(--e-dark)' }
                    : { background: 'var(--e-bg)', color: 'var(--e-muted)', border: '2px solid var(--e-border)' }
                }
              >
                {allDone ? '✓' : day}
              </div>
              {isToday && (
                <div className="w-1 h-1 rounded-full" style={{ background: 'var(--e-dark)' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
