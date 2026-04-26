import { useEffect, useState } from 'react';
import { ALL_TASKS } from './data/tasks';
import { useEcoStore } from './store/useEcoStore';
import { useAuthStore } from './store/useAuthStore';
import TaskCard from './components/TaskCard';
import StreakBanner from './components/StreakBanner';
import CalendarStrip from './components/CalendarStrip';
import AuthScreen from './components/AuthScreen';
import EcoFactCard from './components/EcoFactCard';
import MapTab from './components/MapTab';
import SearchTab from './components/SearchTab';
import ProfileTab from './components/ProfileTab';
import PrizeWheel from './components/PrizeWheel';
import NotificationsPanel from './components/NotificationsPanel';
import { CreatePostModal } from './components/Feed';
import NearbyResolvedAlert from './components/NearbyResolvedAlert';
import { api } from './api/client';
import { initNotifications, stopNotifications, createNotificationChannel } from './services/notificationService';
import './index.css';

type Tab = 'tasks' | 'map' | 'search' | 'wheel' | 'profile';

function avatarBg(name: string): string {
  const colors = ['#063232', '#2B5151', '#1a5c3a', '#1d4d4d', '#0f3d3d'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return colors[Math.abs(h) % colors.length];
}

const NAV_ICONS = {
  tasks:   { active: '🌿', idle: '🌿' },
  map:     { active: '🗺️',  idle: '🗺️'  },
  search:  { active: '🔍', idle: '🔍' },
  wheel:   { active: '⭐', idle: '⭐' },
  profile: { active: '👤', idle: '👤' },
};

export default function App() {
  const [tab, setTab] = useState<Tab>('tasks');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, token } = useAuthStore();
  const { streak, monthlyDays, history, completeTask, getDay, syncWithDB, getDailyAssignment } = useEcoStore();

  // Bildiriş kanalını yarat (Android üçün)
  useEffect(() => {
    createNotificationChannel();
  }, []);

  useEffect(() => {
    if (user && token) {
      syncWithDB();

      // UI-da oxunmamış sayını yenilə
      const fetchUnread = () => {
        api.notifications.list().then(notifs => setUnreadCount(notifs.filter(n => !n.is_read).length)).catch(() => {});
      };
      fetchUnread();
      const timer = setInterval(fetchUnread, 30000);

      // Native Android bildirişlərini başlat
      initNotifications(() => token);

      return () => {
        clearInterval(timer);
        stopNotifications();
      };
    }
  }, [user, token]);

  if (!user) return <AuthScreen />;

  const today = new Date().toISOString().slice(0, 10);
  const assignedIds = getDailyAssignment(today, user.id);
  const dailyTasks = assignedIds.map(id => ALL_TASKS.find(t => t.id === id)!).filter(Boolean);
  const dayRecord = getDay(today);
  const completedIds = new Set(dayRecord?.completedTasks.map(t => t.taskId) ?? []);

  const handleComplete = (taskId: string, photoDataUrl?: string) => {
    completeTask(today, taskId, photoDataUrl, dailyTasks.length);
  };

  const dateLabel = new Date().toLocaleDateString('az-AZ', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const navItems: { id: Tab; label: string }[] = [
    { id: 'tasks',  label: 'Tapşırıqlar' },
    { id: 'map',    label: 'Xəritə' },
    { id: 'search', label: 'Axtar' },
    { id: 'wheel',  label: 'Mükafatlar' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--e-bg)' }}>

      {/* ── Sticky Header ── */}
      <div
        className="sticky top-0 z-40 w-full"
        style={{ background: 'var(--e-dark)' }}
      >
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left: brand */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold"
              style={{ background: 'var(--e-green)', color: 'var(--e-dark)' }}
            >
              G
            </div>
            <div>
              <div className="text-white font-bold text-base leading-tight tracking-wide">GROVE</div>
              <div className="text-xs leading-tight capitalize" style={{ color: 'var(--e-green)', opacity: 0.85 }}>
                {dateLabel}
              </div>
            </div>
          </div>

          {/* Right: bell + avatar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowNotifications(true); setUnreadCount(0); }}
              className="relative w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
              style={{ background: 'rgba(194,223,147,0.15)', border: '1px solid rgba(194,223,147,0.3)' }}
            >
              <span className="text-base">🔔</span>
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 text-white text-[9px] font-bold rounded-full flex items-center justify-center badge-pulse"
                  style={{ background: 'var(--e-orange)' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setTab('profile')}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold transition-opacity hover:opacity-80"
              style={{
                background: avatarBg(user.username),
                border: tab === 'profile' ? '2px solid var(--e-green)' : '2px solid rgba(255,255,255,0.2)',
              }}
            >
              {user.username.slice(0, 2).toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="max-w-md mx-auto px-4 pt-4 pb-28">
        {tab === 'tasks' && (
          <div className="space-y-3">
            <StreakBanner
              streak={streak}
              monthlyDays={monthlyDays}
              completedToday={completedIds.size}
              totalToday={dailyTasks.length}
            />
            <CalendarStrip history={history} />
            <EcoFactCard />
            {dailyTasks.map(task => {
              const done = completedIds.has(task.id);
              const ct = dayRecord?.completedTasks.find(t => t.taskId === task.id);
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  completed={done}
                  photoUrl={ct?.photoDataUrl}
                  onComplete={photo => handleComplete(task.id, photo)}
                />
              );
            })}
          </div>
        )}

        {tab === 'map'     && <MapTab />}
        {tab === 'search'  && <SearchTab onCreateRequest={() => setShowCreatePost(true)} />}
        {tab === 'wheel'   && <PrizeWheel />}
        {tab === 'profile' && <ProfileTab />}
      </div>

      {/* ── Bottom Navigation ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30">
        <div className="max-w-md mx-auto">
          <div className="pb-safe" style={{ background: 'var(--e-white)', borderTop: '1px solid var(--e-border)' }}>
            <div className="flex items-center px-1">

              {navItems.slice(0, 2).map(item => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className="flex-1 flex flex-col items-center py-3 gap-0.5 transition-all"
                  style={{ color: tab === item.id ? 'var(--e-dark)' : '#9BAFAF' }}
                >
                  <span className="text-xl leading-none">{NAV_ICONS[item.id].idle}</span>
                  <span className="text-[10px] font-semibold">{item.label}</span>
                  {tab === item.id && (
                    <div className="w-5 h-0.5 rounded-full mt-0.5" style={{ background: 'var(--e-dark)' }} />
                  )}
                </button>
              ))}

              {/* Center FAB */}
              <div className="flex-none px-2 flex flex-col items-center" style={{ marginTop: '-20px' }}>
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="w-14 h-14 rounded-full text-white text-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
                  style={{ background: 'var(--e-dark)', border: '3px solid var(--e-bg)' }}
                >
                  +
                </button>
                <span className="text-[9px] mt-1 font-medium" style={{ color: '#9BAFAF' }}>Yaz</span>
              </div>

              {navItems.slice(2).map(item => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className="flex-1 flex flex-col items-center py-3 gap-0.5 transition-all"
                  style={{ color: tab === item.id ? 'var(--e-dark)' : '#9BAFAF' }}
                >
                  <span className="text-xl leading-none">{NAV_ICONS[item.id].idle}</span>
                  <span className="text-[10px] font-semibold">{item.label}</span>
                  {tab === item.id && (
                    <div className="w-5 h-0.5 rounded-full mt-0.5" style={{ background: 'var(--e-dark)' }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onCreated={() => { setTab('search'); }}
        />
      )}

      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}

      <NearbyResolvedAlert />
    </div>
  );
}
