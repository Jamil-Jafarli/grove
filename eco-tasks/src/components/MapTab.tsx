import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../api/client';
import type { EcoProblem } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATUS_COLOR: Record<string, string> = {
  reported: '#ef4444',
  claimed:  '#f59e0b',
  resolved: '#22c55e',
};

const STATUS_LABEL: Record<string, string> = {
  reported: '🔴 Açıq',
  claimed:  '🟡 İcrada',
  resolved: '🟢 Həll edildi',
};

function createPin(color: string): L.DivIcon {
  return L.divIcon({
    html: `<div style="width:24px;height:24px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}

// ---- Report Form ----
interface ReportFormProps {
  onClose: () => void;
  onCreated: (p: EcoProblem) => void;
}

function ReportForm({ onClose, onCreated }: ReportFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [photoData, setPhotoData] = useState<string | undefined>();
  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current).setView([40.4093, 49.8671], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 }).addTo(map);
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setCoords({ lat, lng });
      setLocation(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { icon: createPin('#ef4444') }).addTo(map);
      }
    });
    mapRef.current = map;
    setMapReady(true);
    return () => { map.remove(); mapRef.current = null; markerRef.current = null; };
  }, []);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { const url = ev.target?.result as string; setPhotoData(url); setPhotoPreview(url); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim()) { setError('Bütün sahələri doldurun'); return; }
    setSubmitting(true); setError('');
    try {
      const p = await api.problems.report({ title, description, location, photo_data: photoData, lat: coords?.lat, lng: coords?.lng });
      onCreated(p);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Xəta');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-t-3xl shadow-xl overflow-y-auto max-h-[92vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-lg font-bold text-gray-800">📸 Problem Bildir</h2>
          <button onClick={onClose} className="text-gray-400 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-8 space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Başlıq *" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400" />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Problemi təsvir et *" rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 resize-none" />

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">📍 Xəritədən məkan seç</label>
            <div ref={mapContainerRef} style={{ height: '200px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }} />
            {!mapReady && <div className="text-xs text-gray-400 mt-1">Xəritə yüklənir...</div>}
            {coords && <div className="text-xs text-green-600 mt-1 font-medium">✓ {location}</div>}
            {!coords && <div className="text-xs text-gray-400 mt-1">Xəritəyə klikləyərək yer seçin</div>}
          </div>

          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Məkan adı (küçə, məhəllə) *"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400"
          />

          {photoPreview ? (
            <div className="relative">
              <img src={photoPreview} alt="preview" className="w-full h-36 object-cover rounded-xl" />
              <button type="button" onClick={() => { setPhotoData(undefined); setPhotoPreview(undefined); }} className="absolute top-2 right-2 bg-white rounded-full w-7 h-7 text-xs border border-gray-200 shadow flex items-center justify-center">✕</button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:border-red-300 transition-colors">📷 Şəkil əlavə et</button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />

          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 disabled:opacity-50 transition-colors">
            {submitting ? 'Göndərilir...' : '🚨 Problemi Bildir'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ---- Main MapTab ----
export default function MapTab() {
  const { user } = useAuthStore();
  const [problems, setProblems] = useState<EcoProblem[]>([]);
  const [selected, setSelected] = useState<EcoProblem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [listMode, setListMode] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const loadProblems = async () => {
    try { setProblems(await api.problems.list()); } catch { /* ignore */ }
  };

  useEffect(() => { loadProblems(); }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current).setView([40.4093, 49.8671], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; markersRef.current = []; };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    problems.filter(p => p.lat && p.lng).forEach(p => {
      const m = L.marker([p.lat!, p.lng!], { icon: createPin(STATUS_COLOR[p.status]) })
        .addTo(mapRef.current!)
        .bindTooltip(p.title, { permanent: false, direction: 'top' });
      m.on('click', () => setSelected(p));
      markersRef.current.push(m);
    });
  }, [problems]);

  const handleClaim = async (id: number) => {
    setActionLoading(true);
    try {
      const updated = await api.problems.claim(id);
      setProblems(prev => prev.map(p => p.id === id ? updated : p));
      setSelected(updated);
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Xəta'); }
    finally { setActionLoading(false); }
  };

  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolvePhoto, setResolvePhoto] = useState<string | undefined>();
  const [resolvePhotoPreview, setResolvePhotoPreview] = useState<string | undefined>();
  const resolveFileRef = useRef<HTMLInputElement>(null);

  const handleResolvePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { const url = ev.target?.result as string; setResolvePhoto(url); setResolvePhotoPreview(url); };
    reader.readAsDataURL(file);
  };

  const handleResolveSubmit = async () => {
    if (!resolvePhoto) { alert('Həll şəkli mütləq yüklənməlidir'); return; }
    if (!selected) return;
    setActionLoading(true);
    try {
      const updated = await api.problems.resolve(selected.id, resolvePhoto);
      setProblems(prev => prev.map(p => p.id === selected.id ? updated : p));
      setSelected(updated);
      setShowResolveModal(false);
      setResolvePhoto(undefined);
      setResolvePhotoPreview(undefined);
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Xəta'); }
    finally { setActionLoading(false); }
  };

  const counts = {
    reported: problems.filter(p => p.status === 'reported').length,
    claimed:  problems.filter(p => p.status === 'claimed').length,
    resolved: problems.filter(p => p.status === 'resolved').length,
  };

  return (
    <div className="space-y-3">
      {/* Stats bar */}
      <div className="flex gap-2">
        {(['reported','claimed','resolved'] as const).map(s => (
          <div key={s} className="flex-1 bg-white rounded-xl p-2.5 text-center border border-gray-100 shadow-sm">
            <div className="text-lg font-bold text-gray-800">{counts[s]}</div>
            <div className="text-xs text-gray-500">{STATUS_LABEL[s]}</div>
          </div>
        ))}
      </div>

      {/* Toggle list/map */}
      <div className="flex gap-2">
        <button
          onClick={() => setListMode(false)}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${!listMode ? 'bg-green-500 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
        >🗺️ Xəritə</button>
        <button
          onClick={() => setListMode(true)}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${listMode ? 'bg-green-500 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
        >📋 Siyahı</button>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
        >+ Bildir</button>
      </div>

      {/* Map */}
      {!listMode && (
        <div ref={mapContainerRef} style={{ height: '380px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb' }} />
      )}

      {/* List */}
      {listMode && (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {problems.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">Hələ problem bildirilməyib.</div>}
          {problems.map(p => (
            <button
              key={p.id}
              onClick={() => { setSelected(p); setListMode(false); if (p.lat && p.lng && mapRef.current) mapRef.current.setView([p.lat, p.lng], 15); }}
              className="w-full text-left bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:border-green-200 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium">{STATUS_LABEL[p.status]}</span>
                {!p.lat && <span className="text-xs text-gray-300">📍 koordinat yoxdur</span>}
              </div>
              <div className="font-semibold text-sm text-gray-800">{p.title}</div>
              <div className="text-xs text-gray-400 mt-0.5">{p.location}</div>
            </button>
          ))}
        </div>
      )}

      {/* Selected problem panel */}
      {selected && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md bg-white rounded-t-3xl p-5 pb-8 shadow-xl max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-xs font-medium">{STATUS_LABEL[selected.status]}</span>
                <h3 className="font-bold text-gray-800 text-base mt-0.5">{selected.title}</h3>
                <p className="text-xs text-gray-400">📍 {selected.location}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 text-xl ml-3">✕</button>
            </div>

            <p className="text-sm text-gray-600 mb-3">{selected.description}</p>

            {selected.photo_data && (
              <img src={selected.photo_data} alt="problem" className="w-full h-40 object-cover rounded-xl mb-3 border border-gray-200" />
            )}

            {selected.status === 'resolved' && (
              <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2.5 border border-green-200 mb-3">
                <span className="text-xl">🏆</span>
                <span className="text-sm text-green-700 font-semibold">{selected.resolver_username} tərəfindən həll edildi</span>
              </div>
            )}
            {selected.status === 'claimed' && (
              <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-200 mb-3">
                <span className="text-base">🙋</span>
                <span className="text-sm text-amber-700 font-semibold">{selected.claimer_username} icra edir</span>
              </div>
            )}

            <div className="text-xs text-gray-400 mb-4">Bildirən: {selected.reporter_username}</div>

            {selected.status === 'reported' && user?.id !== selected.reporter_id && (
              <button disabled={actionLoading} onClick={() => handleClaim(selected.id)} className="w-full py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 disabled:opacity-50 transition-colors">
                {actionLoading ? '...' : '🙋 Öhdəliyə Götür'}
              </button>
            )}
            {selected.status === 'claimed' && user?.id === selected.claimer_id && (
              <button disabled={actionLoading} onClick={() => setShowResolveModal(true)} className="w-full py-2.5 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 disabled:opacity-50 transition-colors">
                ✅ Həll Edildi — Şəkil Yüklə
              </button>
            )}
          </div>
        </div>
      )}

      {/* Resolve photo modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowResolveModal(false)}>
          <div className="w-full max-w-md bg-white rounded-t-3xl p-5 pb-8 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800">✅ Həlli təsdiqlə</h2>
              <button onClick={() => setShowResolveModal(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <p className="text-sm text-gray-500 mb-3">Problemi həll etdiyinizi təsdiqləyən şəkil yükləyin. Bu şəkil mütləqdir.</p>

            {resolvePhotoPreview ? (
              <div className="relative mb-3">
                <img src={resolvePhotoPreview} alt="preview" className="w-full h-48 object-cover rounded-xl" />
                <button type="button" onClick={() => { setResolvePhoto(undefined); setResolvePhotoPreview(undefined); }} className="absolute top-2 right-2 bg-white rounded-full w-7 h-7 text-xs border border-gray-200 shadow flex items-center justify-center">✕</button>
              </div>
            ) : (
              <button type="button" onClick={() => resolveFileRef.current?.click()} className="w-full border-2 border-dashed border-green-300 rounded-xl py-8 text-sm text-green-500 hover:border-green-400 transition-colors mb-3 font-medium">
                📷 Həll şəklini yüklə (mütləq)
              </button>
            )}
            <input ref={resolveFileRef} type="file" accept="image/*" className="hidden" onChange={handleResolvePhoto} />

            <button
              onClick={handleResolveSubmit}
              disabled={actionLoading || !resolvePhoto}
              className="w-full py-3 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              {actionLoading ? 'Göndərilir...' : '✅ Həllin Təsdiqlə'}
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <ReportForm onClose={() => setShowForm(false)} onCreated={p => { setProblems(prev => [p, ...prev]); }} />
      )}
    </div>
  );
}
