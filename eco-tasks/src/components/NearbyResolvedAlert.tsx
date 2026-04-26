import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import type { EcoProblem } from '../api/client';

const RADIUS_M = 150;
const CHECK_INTERVAL_MS = 60_000;

function distanceM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function NearbyResolvedAlert() {
  const [alert, setAlert] = useState<EcoProblem | null>(null);
  const shownIds = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!navigator.geolocation) return;

    let resolved: EcoProblem[] = [];
    api.problems.list()
      .then(all => { resolved = all.filter(p => p.status === 'resolved' && p.lat && p.lng); })
      .catch(() => {});

    const check = () => {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        for (const p of resolved) {
          if (shownIds.current.has(p.id)) continue;
          if (distanceM(latitude, longitude, p.lat!, p.lng!) <= RADIUS_M) {
            shownIds.current.add(p.id);
            setAlert(p);
            break;
          }
        }
      }, () => {});
    };

    check();
    const timer = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  if (!alert) return null;

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="bg-white border border-green-200 rounded-2xl shadow-xl p-4 max-w-sm w-full pointer-events-auto">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-green-700 text-sm">Burası əvvəllər problemli idi!</div>
            <div className="text-xs text-gray-600 mt-0.5 line-clamp-2">
              «{alert.title}» problemi <span className="font-medium text-gray-700">{alert.location}</span> ünvanında həll edildi. 🌿
            </div>
          </div>
          <button
            onClick={() => setAlert(null)}
            className="text-gray-300 hover:text-gray-500 text-lg flex-shrink-0 leading-none"
          >✕</button>
        </div>
      </div>
    </div>
  );
}
