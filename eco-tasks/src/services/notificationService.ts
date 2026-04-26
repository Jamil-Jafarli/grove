import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

let lastSeenNotifId = 0;
let pollInterval: ReturnType<typeof setInterval> | null = null;

async function requestPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  const { display } = await LocalNotifications.requestPermissions();
  return display === 'granted';
}

export async function initNotifications(getToken: () => string | null) {
  if (!Capacitor.isNativePlatform()) return;

  const granted = await requestPermission();
  if (!granted) return;

  startPolling(getToken);
}

export function stopNotifications() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

function startPolling(getToken: () => string | null) {
  if (pollInterval) clearInterval(pollInterval);

  // ilk dəfə dərhal yoxla, sonra 30s-dən bir
  poll(getToken);
  pollInterval = setInterval(() => poll(getToken), 30_000);
}

async function poll(getToken: () => string | null) {
  const token = getToken();
  if (!token) return;

  try {
    const apiBase = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

    const res = await fetch(`${apiBase}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;

    const notifs: Array<{ id: number; type: string; actor_username: string; is_read: number }> = await res.json();
    const newOnes = notifs.filter(n => !n.is_read && n.id > lastSeenNotifId);

    if (newOnes.length === 0) return;

    lastSeenNotifId = Math.max(...notifs.map(n => n.id));

    const TYPE_TITLE: Record<string, string> = {
      follow_request:  '👤 Yeni izləmə istəyi',
      follow_accepted: '✅ İzləmə qəbul edildi',
      new_follower:    '👥 Yeni izləyici',
      problem_claimed: '🙋 Problem götürüldü',
      problem_resolved:'🏆 Problem həll edildi',
    };

    for (const n of newOnes.slice(0, 5)) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: n.id,
            title: TYPE_TITLE[n.type] ?? '🔔 Grove',
            body: buildBody(n.type, n.actor_username),
            schedule: { at: new Date(Date.now() + 500) },
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#063232',
            channelId: 'grove_main',
          },
        ],
      });
    }

    await fetch(`${apiBase}/notifications/read-all`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  } catch {
    // şəbəkə xətası — sessizliklə keç
  }
}

function buildBody(type: string, actor: string): string {
  switch (type) {
    case 'follow_request':  return `${actor} sizi izləmək istəyir`;
    case 'follow_accepted': return `${actor} izləmə istəyinizi qəbul etdi`;
    case 'new_follower':    return `${actor} sizi izləməyə başladı`;
    case 'problem_claimed': return `${actor} probleminizi icrasına götürdü`;
    case 'problem_resolved':return `${actor} probleminizi həll etdi`;
    default:                return 'Yeni bildiriş var';
  }
}

export async function createNotificationChannel() {
  if (!Capacitor.isNativePlatform()) return;
  await LocalNotifications.createChannel({
    id: 'grove_main',
    name: 'Grove Bildirişlər',
    description: 'Grove tətbiqindən gələn bildirişlər',
    importance: 4,
    visibility: 1,
    vibration: true,
  });
}
