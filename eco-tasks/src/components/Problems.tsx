import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import type { EcoProblem } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

type FilterStatus = 'all' | 'reported' | 'claimed' | 'resolved';

const STATUS_LABEL: Record<string, { label: string; color: string; icon: string }> = {
  reported: { label: 'Açıq', color: 'bg-red-100 text-red-700 border-red-200', icon: '🔴' },
  claimed: { label: 'İcrada', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: '🟡' },
  resolved: { label: 'Həll edildi', color: 'bg-green-100 text-green-700 border-green-200', icon: '🟢' },
};

export default function Problems() {
  const { user } = useAuthStore();
  const [problems, setProblems] = useState<EcoProblem[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [photoData, setPhotoData] = useState<string | undefined>();
  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // resolution photo
  const [resPhotoData, setResPhotoData] = useState<Record<number, string>>({});
  const resFileRef = useRef<HTMLInputElement>(null);
  const [pendingResolveId, setPendingResolveId] = useState<number | null>(null);

  const loadProblems = async () => {
    try {
      const data = await api.problems.list();
      setProblems(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProblems(); }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setPhotoData(url);
      setPhotoPreview(url);
    };
    reader.readAsDataURL(file);
  };

  const handleResPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || pendingResolveId === null) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setResPhotoData(prev => ({ ...prev, [pendingResolveId]: url }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim()) {
      setFormError('Bütün sahələri doldurun');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const newP = await api.problems.report({ title, description, location, photo_data: photoData });
      setProblems(prev => [newP, ...prev]);
      setTitle(''); setDescription(''); setLocation('');
      setPhotoData(undefined); setPhotoPreview(undefined);
      setShowForm(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaim = async (id: number) => {
    setActionLoading(id);
    try {
      const updated = await api.problems.claim(id);
      setProblems(prev => prev.map(p => p.id === id ? updated : p));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Xəta');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolve = async (id: number) => {
    setActionLoading(id);
    try {
      const updated = await api.problems.resolve(id, resPhotoData[id]);
      setProblems(prev => prev.map(p => p.id === id ? updated : p));
      setResPhotoData(prev => { const n = { ...prev }; delete n[id]; return n; });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Xəta');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu problemi silmək istəyirsiniz?')) return;
    setActionLoading(id);
    try {
      await api.problems.delete(id);
      setProblems(prev => prev.filter(p => p.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Xəta');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = filter === 'all' ? problems : problems.filter(p => p.status === filter);

  const counts = {
    reported: problems.filter(p => p.status === 'reported').length,
    claimed: problems.filter(p => p.status === 'claimed').length,
    resolved: problems.filter(p => p.status === 'resolved').length,
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {(['reported', 'claimed', 'resolved'] as const).map(s => {
          const st = STATUS_LABEL[s];
          return (
            <button
              key={s}
              onClick={() => setFilter(prev => prev === s ? 'all' : s)}
              className={`rounded-xl p-3 text-center border transition-all ${filter === s ? st.color + ' border-current' : 'bg-white border-gray-200 hover:border-gray-300'}`}
            >
              <div className="text-xl font-bold">{counts[s]}</div>
              <div className="text-xs font-medium mt-0.5">{st.icon} {st.label}</div>
            </button>
          );
        })}
      </div>

      {/* Report button */}
      <button
        onClick={() => setShowForm(prev => !prev)}
        className="w-full py-3 rounded-2xl bg-red-500 text-white font-bold text-sm shadow hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
      >
        <span>{showForm ? '✕ Formu bağla' : '📸 Ekoloji Problem Bildir'}</span>
      </button>

      {/* Report form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3"
        >
          <h3 className="font-bold text-gray-800 text-base">Yeni Ekoloji Problem</h3>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Başlıq *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Məs: Küçə 14-də zibillik daşır"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Məkan *</label>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Məs: Nəsimi r-nu, Bülbül küç. 7"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Təsvir *</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Problemi ətraflı təsvir edin..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Şəkil (ixtiyari)</label>
            {photoPreview ? (
              <div className="relative">
                <img src={photoPreview} alt="preview" className="w-full h-40 object-cover rounded-xl border border-gray-200" />
                <button
                  type="button"
                  onClick={() => { setPhotoData(undefined); setPhotoPreview(undefined); }}
                  className="absolute top-2 right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center text-xs border border-gray-200 shadow"
                >✕</button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-sm text-gray-400 hover:border-green-300 hover:text-green-500 transition-colors"
              >
                📷 Şəkil əlavə et
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
          </div>

          {formError && <p className="text-red-500 text-xs">{formError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Göndərilir...' : '✅ Problemi Bildir'}
          </button>
        </form>
      )}

      {/* Problem list */}
      {loading ? (
        <div className="text-center py-8 text-gray-400 text-sm">Yüklənir...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">
          {filter === 'all' ? 'Hələ heç bir problem bildirilməyib.' : 'Bu kateqoriyada problem yoxdur.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => {
            const st = STATUS_LABEL[p.status];
            const isExpanded = expandedId === p.id;
            const isOwner = user?.id === p.reporter_id;
            const isClaimer = user?.id === p.claimer_id;
            const busy = actionLoading === p.id;

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${
                  p.status === 'resolved' ? 'border-green-300' :
                  p.status === 'claimed' ? 'border-amber-300' : 'border-red-200'
                }`}
              >
                {/* Header */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${st.color}`}>
                          {st.icon} {st.label}
                        </span>
                        {isOwner && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-medium">
                            Mənim problemim
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-800 text-sm leading-tight">{p.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">📍 {p.location}</p>
                    </div>
                    <span className="text-gray-400 text-xs flex-shrink-0 mt-1">{isExpanded ? '▲' : '▼'}</span>
                  </div>

                  {/* Resolution banner */}
                  {p.status === 'resolved' && (
                    <div className="mt-2 flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2 border border-green-200">
                      <span className="text-lg">🏆</span>
                      <span className="text-xs text-green-700 font-semibold">
                        <span className="font-bold">{p.resolver_username}</span> tərəfindən həll edildi
                      </span>
                    </div>
                  )}
                  {p.status === 'claimed' && (
                    <div className="mt-2 flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2 border border-amber-200">
                      <span className="text-base">🙋</span>
                      <span className="text-xs text-amber-700 font-semibold">
                        <span className="font-bold">{p.claimer_username}</span> icra edir
                      </span>
                    </div>
                  )}
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                    <p className="text-sm text-gray-600 leading-relaxed">{p.description}</p>

                    {p.photo_data && (
                      <img src={p.photo_data} alt="problem" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
                    )}

                    <div className="text-xs text-gray-400 space-y-0.5">
                      <div>📢 <span className="font-medium text-gray-500">{p.reporter_username}</span> tərəfindən bildirildi</div>
                      <div>🕐 {new Date(p.created_at).toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      {p.resolved_at && (
                        <div>✅ {new Date(p.resolved_at).toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' })} tarixində həll edildi</div>
                      )}
                    </div>

                    {p.resolution_photo && (
                      <div>
                        <p className="text-xs font-semibold text-green-700 mb-1">✅ Həll fotosu:</p>
                        <img src={p.resolution_photo} alt="resolved" className="w-full h-40 object-cover rounded-xl border border-green-200" />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-1">
                      {p.status === 'reported' && !isOwner && (
                        <button
                          disabled={busy}
                          onClick={() => handleClaim(p.id)}
                          className="w-full py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 disabled:opacity-50 transition-colors"
                        >
                          {busy ? 'Gözləyin...' : '🙋 Öhdəliyə Götür'}
                        </button>
                      )}

                      {p.status === 'claimed' && isClaimer && (
                        <div className="space-y-2">
                          {resPhotoData[p.id] ? (
                            <div className="relative">
                              <img src={resPhotoData[p.id]} alt="res preview" className="w-full h-32 object-cover rounded-xl border border-green-200" />
                              <button
                                type="button"
                                onClick={() => setResPhotoData(prev => { const n = { ...prev }; delete n[p.id]; return n; })}
                                className="absolute top-2 right-2 bg-white rounded-full w-6 h-6 text-xs border border-gray-200 shadow flex items-center justify-center"
                              >✕</button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => { setPendingResolveId(p.id); resFileRef.current?.click(); }}
                              className="w-full border-2 border-dashed border-green-200 rounded-xl py-3 text-sm text-green-500 hover:border-green-400 transition-colors"
                            >
                              📷 Həll fotosu əlavə et (ixtiyari)
                            </button>
                          )}
                          <button
                            disabled={busy}
                            onClick={() => handleResolve(p.id)}
                            className="w-full py-2.5 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 disabled:opacity-50 transition-colors"
                          >
                            {busy ? 'Gözləyin...' : '✅ Həll Edildi Kimi İşarələ'}
                          </button>
                        </div>
                      )}

                      {p.status === 'reported' && isOwner && (
                        <button
                          disabled={busy}
                          onClick={() => handleDelete(p.id)}
                          className="w-full py-2 rounded-xl border border-red-200 text-red-500 font-medium text-sm hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                          {busy ? 'Gözləyin...' : '🗑 Sil'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <input
        ref={resFileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleResPhotoChange}
      />
    </div>
  );
}
