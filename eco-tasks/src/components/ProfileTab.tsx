import { useEffect, useState } from 'react';
import Leaderboard from './Leaderboard';
import { useAuthStore } from '../store/useAuthStore';
import { useEcoStore } from '../store/useEcoStore';
import { api } from '../api/client';
import type { Post } from '../api/client';

type Section = 'overview' | 'posts' | 'leaderboard' | 'settings';

function timeAgo(dateStr: string): string {
  const s = dateStr.replace(' ', 'T');
  const diff = (Date.now() - new Date(s.endsWith('Z') ? s : s + 'Z').getTime()) / 1000;
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

interface MiniPostProps {
  post: Post;
  onDelete: (id: number) => void;
}

function MiniPost({ post, onDelete }: MiniPostProps) {
  return (
    <div className="enviro-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate" style={{ color: 'var(--e-text)' }}>{post.title}</div>
          <div className="text-xs line-clamp-2 mt-0.5" style={{ color: 'var(--e-muted)' }}>{post.body}</div>
          <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: 'var(--e-muted)' }}>
            <span>🍃 {post.leaf_count}</span>
            <span>💬 {post.comments.length}</span>
            <span>{timeAgo(post.created_at)}</span>
          </div>
        </div>
        {post.photo_data && (
          <img src={post.photo_data} alt="" className="w-14 h-14 object-cover rounded-xl flex-shrink-0" style={{ border: '1px solid var(--e-border)' }} />
        )}
      </div>
      <button
        onClick={() => onDelete(post.id)}
        className="mt-2 text-xs transition-colors hover:opacity-70"
        style={{ color: '#FECDD3' }}
      >
        🗑 Sil
      </button>
    </div>
  );
}

export default function ProfileTab() {
  const [section, setSection] = useState<Section>('overview');
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [problemXal, setProblemXal] = useState(0);

  // Settings state
  const [phone, setPhone] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const { user, logout } = useAuthStore();
  const { monthlyDays, streak, totalXal } = useEcoStore();

  const sections: { id: Section; icon: string; label: string }[] = [
    { id: 'overview',    icon: '🏠', label: 'Ümumi' },
    { id: 'posts',       icon: '📝', label: 'Paylaşımlar' },
    { id: 'leaderboard', icon: '🏆', label: 'Liderlik' },
    { id: 'settings',    icon: '⚙️', label: 'Tənzimləmələr' },
  ];

  useEffect(() => {
    if (!user) return;
    api.users.stats(user.id).then(s => {
      setFollowerCount(s.followerCount);
      setFollowingCount(s.followingCount);
      setProblemXal(s.resolvedProblems * 1000);
      setPosts(s.posts);
      setIsPrivate(s.isPrivate);
      setPhone(s.phoneNumber || '');
    }).catch(() => {});
  }, [user]);

  // Load posts when switching to posts section
  useEffect(() => {
    if (section !== 'posts' || !user) return;
    if (posts.length > 0) return; // already loaded
    setPostsLoading(true);
    api.users.stats(user.id).then(s => setPosts(s.posts)).catch(() => {}).finally(() => setPostsLoading(false));
  }, [section, user]);

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Bu paylaşımı silmək istəyirsiniz?')) return;
    try {
      await api.posts.delete(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch { /* ignore */ }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await api.users.updateMe({ phone_number: phone || undefined, is_private: isPrivate });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch { /* ignore */ } finally { setSavingSettings(false); }
  };

  const fullXal = totalXal + problemXal;

  return (
    <div className="space-y-4">
      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full ${avatarBg(user?.username ?? '')} flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`}>
            {user?.username?.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="font-bold text-gray-800 text-lg truncate">{user?.username}</div>
              {isPrivate && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">🔒 Gizli</span>}
            </div>
            <div className="text-xs text-gray-400 truncate">{user?.email}</div>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-gray-600"><strong>{followerCount}</strong> <span className="text-xs text-gray-400">izləyici</span></span>
              <span className="text-gray-600"><strong>{followingCount}</strong> <span className="text-xs text-gray-400">izlənən</span></span>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 flex-shrink-0"
          >
            Çıxış
          </button>
        </div>

        {/* Xal display */}
        <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⭐</span>
            <div>
              <div className="text-xs text-gray-500 font-medium">Ekoloji xal</div>
              <div className="text-2xl font-bold text-green-700">{fullXal}</div>
            </div>
          </div>
          <div className="text-right text-xs text-gray-400">
            <div>{streak} gün davamiyyət</div>
            <div>{monthlyDays}/30 bu ay</div>
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100 gap-1">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`flex-1 py-2 px-1 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1 ${
              section === s.id ? 'bg-green-500 text-white shadow' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {section === 'overview' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-gray-700 text-sm">Statistika</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-green-700">{totalXal}</div>
              <div className="text-xs text-gray-500">Tapşırıq xalı</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-blue-700">{problemXal}</div>
              <div className="text-xs text-gray-500">Problem xalı</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-orange-700">{streak}</div>
              <div className="text-xs text-gray-500">Davamiyyət</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-purple-700">{monthlyDays}</div>
              <div className="text-xs text-gray-500">Bu ay</div>
            </div>
          </div>
        </div>
      )}

      {/* Posts */}
      {section === 'posts' && (
        <div className="space-y-3">
          {postsLoading ? (
            <div className="text-center py-8 text-gray-400">Yüklənir...</div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-gray-400 text-sm">Hələ paylaşım yoxdur</p>
            </div>
          ) : (
            posts.map(post => (
              <MiniPost key={post.id} post={post} onDelete={handleDeletePost} />
            ))
          )}
        </div>
      )}

      {/* Leaderboard */}
      {section === 'leaderboard' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <Leaderboard />
        </div>
      )}

      {/* Settings */}
      {section === 'settings' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-800">Profil tənzimləmələri</h3>

          {/* Privacy toggle */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <div className="font-medium text-gray-700 text-sm">Gizli profil</div>
              <div className="text-xs text-gray-400">Paylaşımlarınız yalnız izləyicilərə görünər</div>
            </div>
            <button
              onClick={() => setIsPrivate(p => !p)}
              className={`w-12 h-6 rounded-full transition-colors relative ${isPrivate ? 'bg-green-500' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${isPrivate ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Phone number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon nömrəsi</label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+994 50 xxx xx xx"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400"
            />
            <div className="text-xs text-gray-400 mt-1">Gizli profildə başqaları görə bilməz</div>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="w-full py-3 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            {settingsSaved ? '✓ Saxlanıldı' : savingSettings ? 'Saxlanılır...' : 'Saxla'}
          </button>
        </div>
      )}
    </div>
  );
}
