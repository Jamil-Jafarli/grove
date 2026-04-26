import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { LeaderboardEntry } from '../api/client';

const PALETTE = [
  '#e53e3e','#dd6b20','#d69e2e','#38a169',
  '#2f855a','#2c7a7b','#2b6cb0','#553c9a',
  '#b83280','#c53030','#276749','#2a4365',
];

function avatarBg(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

function initials(name: string) {
  const parts = name.replace(/[_\-.]/g, ' ').trim().split(/\s+/);
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

const TIERS = [
  { min: 5000, label: 'Əfsanə', emoji: '🔥', text: '#b91c1c', bg: '#fff1f2' },
  { min: 2000, label: 'Ekspert', emoji: '⚡', text: '#c2410c', bg: '#fff7ed' },
  { min: 500,  label: 'Aktiv',   emoji: '💪', text: '#92400e', bg: '#fffbeb' },
  { min: 100,  label: 'Könüllü', emoji: '🌱', text: '#166534', bg: '#f0fdf4' },
];

function getTier(xal: number) {
  return TIERS.find(t => xal >= t.min);
}

function pctLabel(rank: number, total: number) {
  if (total === 0) return '';
  const p = Math.round((rank / total) * 100);
  if (p <= 5)  return 'Top 5%';
  if (p <= 10) return 'Top 10%';
  if (p <= 25) return 'Top 25%';
  if (p <= 50) return 'Top 50%';
  return `Alt ${100 - p}%`;
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.leaderboard.get()
      .then(data => {
        setEntries(data.leaderboard);
        setMyRank(data.currentUserRank);
        setTotalUsers(data.totalUsers ?? data.leaderboard.length);
      })
      .catch(() => setError('Liderlik cədvəli yüklənmədi'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ height: 56, borderRadius: 10, background: `hsl(${140 + i * 3}, 20%, ${92}%)`, opacity: 1 - i * 0.1 }} />
        ))}
      </div>
    );
  }

  if (error) return <p style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0' }}>{error}</p>;

  const me = entries.find(e => e.isCurrentUser);
  const maxXal = Math.max(...entries.map(e => e.totalXal), 1);

  const top3 = entries.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const podiumHeights = [68, 92, 52];
  const podiumStyles = [
    { bg: '#f1f5f9', border: '#cbd5e1' },
    { bg: '#fef9c3', border: '#fde68a' },
    { bg: '#ffedd5', border: '#fdba74' },
  ];
  const prevEntry = myRank > 1 && myRank <= 25 ? entries[myRank - 2] : null;

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>

      {/* My position card */}
      {myRank > 0 && me && (
        <div style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
          borderRadius: 14, padding: '16px 18px', color: 'white', marginBottom: 18,
          boxShadow: '0 4px 16px rgba(6,78,59,0.25)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Ümumi sıra
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 36, fontWeight: 800, lineHeight: 1, letterSpacing: '-1px' }}>
                  {myRank === 1 ? '🥇' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : `#${myRank}`}
                </span>
                {myRank > 3 && <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>/ {totalUsers}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 20, padding: '4px 11px', fontSize: 12, fontWeight: 700 }}>
                {pctLabel(myRank, totalUsers)}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <span>⭐</span>
                <span style={{ fontWeight: 600 }}>{me.totalXal}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>xal</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', margin: '12px 0 10px' }} />

          <div style={{ fontSize: 12 }}>
            {myRank === 1 ? (
              <span style={{ fontWeight: 600, color: '#fcd34d' }}>🏆 Siyahıda birincisən!</span>
            ) : prevEntry ? (
              <>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Sonrakı: </span>
                <span style={{ fontWeight: 600 }}>{prevEntry.username}</span>
                {prevEntry.totalXal - me.totalXal > 0 ? (
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}> · {prevEntry.totalXal - me.totalXal} xal geri</span>
                ) : (
                  <span style={{ color: '#86efac' }}> · eyni xal!</span>
                )}
              </>
            ) : (
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>Tapşırıqları yerinə yetirərək yuxarı çıx</span>
            )}
          </div>
        </div>
      )}

      {/* Podium */}
      {top3.length >= 3 && (
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10, marginBottom: 18, paddingTop: 8 }}>
          {podiumOrder.map((entry, idx) => {
            const podRank = top3.findIndex(e => e.userId === entry.userId) + 1;
            const h = podiumHeights[idx];
            const plat = podiumStyles[idx];
            const rankIcons = ['🥈', '🥇', '🥉'];
            const rankColors = ['#6b7280', '#d97706', '#c2410c'];
            return (
              <div key={entry.userId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flex: 1, maxWidth: 92 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: rankColors[idx] }}>{rankIcons[idx]}</div>
                <div style={{ position: 'relative', marginBottom: 2 }}>
                  {podRank === 1 && <span style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', fontSize: 15 }}>👑</span>}
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: avatarBg(entry.username), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13, outline: entry.isCurrentUser ? '2.5px solid #22c55e' : 'none', outlineOffset: 2 }}>
                    {initials(entry.username)}
                  </div>
                </div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#374151', margin: 0, maxWidth: 84, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>{entry.username}</p>
                <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>⭐ {entry.totalXal}</p>
                <div style={{ width: '100%', height: h, borderRadius: '6px 6px 0 0', background: plat.bg, border: `1px solid ${plat.border}`, borderBottom: 'none' }} />
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {entries.map((entry, idx) => {
          const rank = idx + 1;
          const tier = getTier(entry.totalXal);
          const isMe = entry.isCurrentUser;
          const barW = Math.max(4, Math.round((entry.totalXal / maxXal) * 100));
          const barColor = entry.totalXal >= 5000 ? '#ef4444' : entry.totalXal >= 2000 ? '#f97316' : entry.totalXal >= 500 ? '#eab308' : '#86efac';

          return (
            <div key={entry.userId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: isMe ? '1.5px solid #16a34a' : rank <= 3 ? '1px solid #e5e7eb' : '1px solid #f3f4f6', background: isMe ? '#f0fdf4' : 'white' }}>
              <div style={{ width: 26, textAlign: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0, color: rank === 1 ? '#d97706' : rank === 2 ? '#6b7280' : rank === 3 ? '#c2410c' : '#9ca3af' }}>
                {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
              </div>
              <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: avatarBg(entry.username), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 12, boxShadow: isMe ? '0 0 0 2px #16a34a' : '0 1px 3px rgba(0,0,0,0.12)' }}>
                {initials(entry.username)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: isMe ? '#15803d' : '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
                    {entry.username}{isMe && <span style={{ color: '#16a34a', fontWeight: 400, fontSize: 11 }}> (siz)</span>}
                  </span>
                  {tier && (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: tier.bg, color: tier.text, flexShrink: 0 }}>
                      {tier.emoji} {tier.label}
                    </span>
                  )}
                </div>
                <div style={{ height: 3, background: '#f3f4f6', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 2, width: `${barW}%`, background: barColor }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                <span style={{ fontSize: 12 }}>⭐</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1f2937' }}>{entry.totalXal}</span>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: '#d1d5db', marginTop: 12 }}>
        {totalUsers} istifadəçi · xala görə sıralanır
      </p>
    </div>
  );
}
