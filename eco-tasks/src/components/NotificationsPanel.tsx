import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { AppNotification } from '../api/client';

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00Z')).getTime()) / 1000;
  if (diff < 60) return 'indi';
  if (diff < 3600) return `${Math.floor(diff / 60)} dəq. əvvəl`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat əvvəl`;
  return `${Math.floor(diff / 86400)} gün əvvəl`;
}

function avatarBg(name: string): string {
  const colors = ['#063232', '#2B5151', '#1a5c3a', '#1d4d4d', '#0f3d3d'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return colors[Math.abs(h) % colors.length];
}

const TYPE_ICON: Record<string, string> = {
  follow_request: '👤',
  follow_accepted: '✅',
  new_follower: '👥',
  problem_claimed: '🙋',
  problem_resolved: '🏆',
};

const TYPE_TEXT: Record<string, (n: AppNotification) => string> = {
  follow_request: n => `${n.actor_username} sizi izləmək istəyir`,
  follow_accepted: n => `${n.actor_username} izləmə istəyinizi qəbul etdi`,
  new_follower: n => `${n.actor_username} sizi izləməyə başladı`,
  problem_claimed: n => `${n.actor_username} probleminizi icrasına götürdü`,
  problem_resolved: n => `${n.actor_username} probleminizi həll etdi`,
};

interface NotificationItemProps {
  notif: AppNotification;
  onApprove: (actorId: number, notifId: number) => void;
  onDecline: (actorId: number, notifId: number) => void;
}

function NotificationItem({ notif, onApprove, onDecline }: NotificationItemProps) {
  const [loading, setLoading] = useState(false);
  const [handled, setHandled] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await api.users.approveFollow(notif.actor_id);
      setHandled(true);
    } catch { /* ignore */ } finally { setLoading(false); }
    onApprove(notif.actor_id, notif.id);
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      await api.users.declineFollow(notif.actor_id);
      setHandled(true);
    } catch { /* ignore */ } finally { setLoading(false); }
    onDecline(notif.actor_id, notif.id);
  };

  return (
    <div
      className="flex items-start gap-3 p-3 rounded-xl transition-all"
      style={
        notif.is_read
          ? { background: 'var(--e-white)' }
          : { background: 'var(--e-bg)', border: '1px solid var(--e-border)' }
      }
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
        style={{ background: avatarBg(notif.actor_username) }}
      >
        {notif.actor_username.slice(0, 2).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm" style={{ color: 'var(--e-text)' }}>
          <span className="mr-1">{TYPE_ICON[notif.type] ?? '🔔'}</span>
          {TYPE_TEXT[notif.type]?.(notif) ?? 'Bildiriş'}
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--e-muted)' }}>{timeAgo(notif.created_at)}</div>

        {notif.type === 'follow_request' && !handled && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="px-3 py-1 text-xs font-semibold rounded-lg disabled:opacity-50 transition-all hover:opacity-80"
              style={{ background: 'var(--e-dark)', color: 'var(--e-green)' }}
            >
              {loading ? '...' : '✓ Qəbul et'}
            </button>
            <button
              onClick={handleDecline}
              disabled={loading}
              className="px-3 py-1 text-xs font-semibold rounded-lg disabled:opacity-50 transition-all hover:opacity-80"
              style={{ background: 'var(--e-bg)', color: 'var(--e-muted)', border: '1px solid var(--e-border)' }}
            >
              Rədd et
            </button>
          </div>
        )}
        {notif.type === 'follow_request' && handled && (
          <div className="text-xs mt-1" style={{ color: 'var(--e-muted)' }}>İşləndi ✓</div>
        )}
      </div>

      {!notif.is_read && (
        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: 'var(--e-dark)' }} />
      )}
    </div>
  );
}

interface Props {
  onClose: () => void;
}

export default function NotificationsPanel({ onClose }: Props) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.notifications.list()
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await api.notifications.readAll().catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
  };

  const handleApprove = (_actorId: number, notifId: number) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: 1 } : n));
  };

  const handleDecline = (_actorId: number, notifId: number) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: 1 } : n));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center"
      style={{ background: 'rgba(6,50,50,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-b-3xl shadow-2xl max-h-[80vh] flex flex-col"
        style={{ background: 'var(--e-white)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--e-border)' }}
        >
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold" style={{ color: 'var(--e-text)' }}>🔔 Bildirişlər</h2>
            {unreadCount > 0 && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'var(--e-dark)', color: 'var(--e-green)' }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ color: 'var(--e-dark)' }}
              >
                Hamısını oxu
              </button>
            )}
            <button
              onClick={onClose}
              className="text-xl transition-opacity hover:opacity-60"
              style={{ color: 'var(--e-muted)' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-3 space-y-2">
          {loading ? (
            <div className="text-center py-10" style={{ color: 'var(--e-muted)' }}>Yüklənir...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-2">🔕</div>
              <p className="text-sm" style={{ color: 'var(--e-muted)' }}>Hələ bildiriş yoxdur</p>
            </div>
          ) : (
            notifications.map(n => (
              <NotificationItem
                key={n.id}
                notif={n}
                onApprove={handleApprove}
                onDecline={handleDecline}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
