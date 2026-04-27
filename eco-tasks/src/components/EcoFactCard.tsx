import { useState } from 'react';
import { getDailyFact, getRandomFact } from '../data/ecoFacts';
import type { EcoFact } from '../data/ecoFacts';

const categoryColor: Record<string, { bg: string; text: string; border: string }> = {
  'Plastik':        { bg: '#FFF4ED', text: '#9A3412', border: '#FDBA74' },
  'İqlim':          { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE' },
  'Azərbaycan':     { bg: '#F0FDF4', text: '#166534', border: '#C2DF93' },
  'Biomüxtəliflik': { bg: '#FAF5FF', text: '#6B21A8', border: '#DDD6FE' },
  'Meşə':           { bg: '#ECFDF5', text: '#065F46', border: '#6EE7B7' },
  'Su':             { bg: '#ECFEFF', text: '#164E63', border: '#A5F3FC' },
  'Enerji':         { bg: '#FEFCE8', text: '#713F12', border: '#FDE047' },
  'Nəqliyyat':      { bg: '#F0FDFA', text: '#134E4A', border: '#5EEAD4' },
  'Okean':          { bg: '#EEF2FF', text: '#3730A3', border: '#C7D2FE' },
  'Torpaq':         { bg: '#FFFBEB', text: '#78350F', border: '#FCD34D' },
  'Geri emal':      { bg: '#F7FEE7', text: '#3F6212', border: '#BEF264' },
};

export default function EcoFactCard() {
  const [fact, setFact] = useState<EcoFact>(getDailyFact());
  const [expanded, setExpanded] = useState(false);
  const [animating, setAnimating] = useState(false);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (animating) return;
    setAnimating(true);
    setExpanded(false);
    setTimeout(() => {
      setFact(prev => getRandomFact(prev));
      setAnimating(false);
    }, 200);
  };

  const c = categoryColor[fact.category] ?? { bg: '#F9FAFB', text: '#374151', border: '#E5E7EB' };

  return (
    <div
      onClick={() => setExpanded(p => !p)}
      className={`cursor-pointer enviro-card p-4 transition-all duration-200 select-none task-card-hover ${animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md"
            style={{ background: 'var(--e-dark)', color: 'var(--e-green)' }}
          >
            Günün maraqlı faktı
          </span>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
            style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
          >
            {fact.category}
          </span>
        </div>
        <span className="text-xs" style={{ color: 'var(--e-muted)' }}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {/* Fact body */}
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: 'var(--e-bg)', border: '1px solid var(--e-border)' }}
        >
          {fact.icon}
        </div>
        <p className="text-sm leading-relaxed font-medium flex-1" style={{ color: 'var(--e-text)' }}>
          {fact.text}
        </p>
      </div>

      {expanded && (
        <div
          className="mt-3 pt-3 text-sm leading-relaxed rounded-xl p-3"
          style={{ background: 'var(--e-bg)', color: 'var(--e-muted)', border: '1px solid var(--e-border)' }}
        >
          {fact.detail}
        </div>
      )}

      <button
        onClick={handleNext}
        className="mt-3 w-full text-xs font-semibold py-2 rounded-xl transition-all hover:opacity-80"
        style={{
          background: 'var(--e-bg)',
          color: 'var(--e-dark)',
          border: '1px solid var(--e-border)',
        }}
      >
        🔄 Digər bir fakt
      </button>
    </div>
  );
}
