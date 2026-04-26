import { useEffect, useRef, useState } from 'react';
import type { TaskTemplate } from '../data/tasks';

interface Props {
  task: TaskTemplate;
  completed: boolean;
  photoUrl?: string;
  onComplete: (photoDataUrl?: string) => void;
}

const categoryStyle: Record<string, { bg: string; text: string; border: string; accent: string }> = {
  water:     { bg: '#ECFEFF', text: '#164E63', border: '#A5F3FC', accent: '#0EA5E9' },
  waste:     { bg: '#FFF4ED', text: '#9A3412', border: '#FDBA74', accent: '#F97316' },
  nature:    { bg: '#F0FDF4', text: '#166534', border: '#C2DF93', accent: '#22C55E' },
  transport: { bg: '#F0FDFA', text: '#134E4A', border: '#5EEAD4', accent: '#14B8A6' },
  energy:    { bg: '#FEFCE8', text: '#713F12', border: '#FDE047', accent: '#EAB308' },
  food:      { bg: '#F7FEE7', text: '#3F6212', border: '#BEF264', accent: '#84CC16' },
};

export default function TaskCard({ task, completed, photoUrl, onComplete }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(photoUrl);
  const [loading, setLoading] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const completingRef = useRef(false);

  useEffect(() => {
    if (photoUrl) setPreview(photoUrl);
  }, [photoUrl]);

  const cs = categoryStyle[task.category] ?? categoryStyle.nature;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);
      setLoading(false);
      onComplete(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleComplete = () => {
    if (completed || completingRef.current) return;
    if (task.requiresPhoto) {
      fileRef.current?.click();
    } else {
      completingRef.current = true;
      onComplete();
    }
  };

  return (
    <div
      className={`relative enviro-card overflow-hidden transition-all duration-300 ${!completed ? 'task-card-hover cursor-pointer' : ''}`}
      style={completed ? { background: '#F9FFFE', borderColor: 'var(--e-green)' } : {}}
      onClick={!completed ? handleComplete : undefined}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: completed ? 'var(--e-dark)' : cs.accent }}
      />

      <div className="pl-4 pr-4 py-4">
        {/* Completed checkmark */}
        {completed && (
          <div
            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center shadow-sm"
            style={{ background: 'var(--e-dark)' }}
          >
            <span className="text-[11px] font-bold" style={{ color: 'var(--e-green)' }}>✓</span>
          </div>
        )}

        {/* Main content */}
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: cs.bg, border: `1px solid ${cs.border}` }}
          >
            {task.icon}
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h3
                className="font-semibold text-sm"
                style={{
                  color: completed ? 'var(--e-muted)' : 'var(--e-text)',
                  textDecoration: completed ? 'line-through' : 'none',
                }}
              >
                {task.title}
              </h3>
            </div>
            <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--e-muted)' }}>
              {task.description}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[11px] px-2 py-0.5 rounded-md font-semibold"
                style={{ background: cs.bg, color: cs.text, border: `1px solid ${cs.border}` }}
              >
                +{task.xal} xal
              </span>
              <span
                className="text-[11px] px-2 py-0.5 rounded-md font-semibold"
                style={{ background: '#FFFBEB', color: '#78350F', border: '1px solid #FDE68A' }}
              >
                {task.coin} 🪙
              </span>
              {task.requiresPhoto && !completed && (
                <span
                  className="text-[11px] px-2 py-0.5 rounded-md font-medium flex items-center gap-1"
                  style={{ background: '#EEF2FF', color: '#3730A3', border: '1px solid #C7D2FE' }}
                >
                  📷 şəkil
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Photo preview */}
        {preview && (
          <>
            <div
              className="mt-3 rounded-xl overflow-hidden cursor-zoom-in"
              style={{ border: '1px solid var(--e-border)' }}
              onClick={e => { e.stopPropagation(); setLightbox(true); }}
            >
              <img src={preview} alt="proof" className="w-full h-32 object-cover" />
            </div>
            {lightbox && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center"
                style={{ background: 'rgba(6,50,50,0.92)' }}
                onClick={() => setLightbox(false)}
              >
                <img src={preview} alt="proof" className="max-w-full max-h-full object-contain rounded-xl" />
                <button
                  className="absolute top-4 right-4 text-2xl font-bold opacity-70 hover:opacity-100"
                  style={{ color: 'var(--e-green)' }}
                >
                  ✕
                </button>
              </div>
            )}
          </>
        )}

        {/* Action button */}
        {!completed && (
          <button
            className="mt-3 w-full py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90 active:scale-[0.98]"
            style={
              task.requiresPhoto
                ? { background: '#EEF2FF', color: '#3730A3', border: '1px solid #C7D2FE' }
                : { background: 'var(--e-dark)', color: 'var(--e-green)' }
            }
            onClick={(e) => { e.stopPropagation(); handleComplete(); }}
          >
            {loading ? 'Yüklənir...' : task.requiresPhoto ? '📷 Şəkil çək / seç' : '✓ Tamamlandı'}
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
