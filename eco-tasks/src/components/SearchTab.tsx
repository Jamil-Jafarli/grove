import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import type { Post, UserSearchResult, UserStats } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

/* ─── helpers ─── */

function timeAgo(dateStr: string): string {
  const s = dateStr.replace(' ', 'T');
  const diff = (Date.now() - new Date(s.endsWith('Z') ? s : s + 'Z').getTime()) / 1000;
  if (diff < 60) return 'indi';
  if (diff < 3600) return `${Math.floor(diff / 60)} dəq. əvvəl`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat əvvəl`;
  return `${Math.floor(diff / 86400)} gün əvvəl`;
}

function avatarBg(name: string): string {
  const colors = ['bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return colors[Math.abs(h) % colors.length];
}

/* ─── User profile view ─── */

interface UserProfileProps {
  userId: number;
  username: string;
  currentUserId: number;
  onBack: () => void;
}

function UserProfile({ userId, username, currentUserId, onBack }: UserProfileProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const isOwn = userId === currentUserId;

  useEffect(() => {
    api.users.stats(userId)
      .then(s => {
        setStats(s);
        setIsFollowing(s.isFollowing);
        setFollowerCount(s.followerCount);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      const result = await api.users.follow(userId);
      setIsFollowing(result.isFollowing);
      setFollowerCount(result.followerCount);
    } catch { /* ignore */ } finally { setFollowLoading(false); }
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-green-600 font-medium">
        ← Geri
      </button>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Yüklənir...</div>
      ) : !stats ? (
        <div className="text-center py-12 text-gray-400">Məlumat tapılmadı</div>
      ) : (
        <>
          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-full ${avatarBg(username)} flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`}>
                {username.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-bold text-gray-800 text-lg">{username}</div>
                  {stats.isPrivate && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">🔒 Gizli</span>}
                </div>
                {stats.phoneNumber && (
                  <div className="text-xs text-gray-400">{stats.phoneNumber}</div>
                )}
                <div className="flex gap-4 mt-1 text-sm">
                  <span className="text-gray-600"><strong>{followerCount}</strong> <span className="text-xs text-gray-400">izləyici</span></span>
                  <span className="text-gray-600"><strong>{stats.followingCount}</strong> <span className="text-xs text-gray-400">izlənən</span></span>
                </div>
              </div>
            </div>

            {/* Xal */}
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <div>
                  <div className="text-xs text-gray-500">Ekoloji xal</div>
                  <div className="text-xl font-bold text-green-700">{stats.totalXal}</div>
                </div>
              </div>
              <div className="text-xs text-gray-400 text-right">
                <div>{stats.taskCount} tapşırıq</div>
                <div>{stats.resolvedProblems} problem</div>
              </div>
            </div>

            {/* Follow button */}
            {!isOwn && (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  isFollowing
                    ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
                    : 'bg-green-500 text-white hover:bg-green-600'
                } disabled:opacity-50`}
              >
                {followLoading ? '...' : isFollowing ? '✓ İzləyirsən' : '+ İzlə'}
              </button>
            )}
          </div>

          {/* Posts */}
          {(stats.posts.length > 0 || !stats.isPrivate || isFollowing) && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide">Paylaşımlar</h3>
              {stats.posts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center text-gray-400 text-sm">
                  Hələ paylaşım yoxdur
                </div>
              ) : (
                stats.posts.map(post => (
                  <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-3">
                      <div className="font-bold text-gray-800 text-sm">{post.title}</div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-3">{post.body}</p>
                      {post.photo_data && (
                        <img src={post.photo_data} alt="" className="w-full h-32 object-cover rounded-lg mt-2" />
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>🍃 {post.leaf_count}</span>
                        <span>💬 {post.comments.length}</span>
                        <span>{timeAgo(post.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {stats.isPrivate && !isFollowing && !isOwn && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center">
              <div className="text-3xl mb-2">🔒</div>
              <p className="text-gray-500 text-sm">Bu profil gizlidir</p>
              <p className="text-gray-400 text-xs mt-1">Paylaşımları görmək üçün izləyin</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Search result user card ─── */

function UserCard({ user, onClick }: { user: UserSearchResult; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3 hover:border-green-300 transition-colors text-left"
    >
      <div className={`w-12 h-12 rounded-full ${avatarBg(user.username)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
        {user.username.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-gray-800">{user.username}</span>
          {user.isPrivate && <span className="text-xs text-gray-400">🔒</span>}
        </div>
        <div className="text-xs text-gray-400">{user.taskCount} tapşırıq · {user.resolvedProblems} problem</div>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-lg font-bold text-green-700">{user.totalXal}</span>
        <span className="text-xs text-gray-400">⭐ xal</span>
      </div>
    </button>
  );
}

/* ─── Post card (feed) ─── */

interface PostCardProps {
  post: Post;
  currentUserId: number;
  onLeaf: (id: number) => void;
  onDelete: (id: number) => void;
  onUsernameClick: (userId: number, username: string) => void;
}

function PostCard({ post, currentUserId, onLeaf, onDelete, onUsernameClick }: PostCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments);
  const [posting, setPosting] = useState(false);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      const c = await api.posts.comment(post.id, commentText.trim());
      setComments(prev => [...prev, c]);
      setCommentText('');
    } catch { /* ignore */ } finally { setPosting(false); }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => onUsernameClick(post.user_id, post.username)}
            className={`w-8 h-8 rounded-full ${avatarBg(post.username)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
          >
            {post.username.slice(0, 2).toUpperCase()}
          </button>
          <div className="flex-1 min-w-0">
            <button onClick={() => onUsernameClick(post.user_id, post.username)} className="text-sm font-semibold text-gray-800 hover:text-green-600 transition-colors">
              {post.username}
            </button>
            <div className="text-xs text-gray-400">{timeAgo(post.created_at)}</div>
          </div>
          {post.user_id === currentUserId && (
            <button onClick={() => onDelete(post.id)} className="text-gray-300 hover:text-red-400 text-sm px-1">🗑</button>
          )}
        </div>
        <h3 className="font-bold text-gray-800 text-base leading-tight mb-1">{post.title}</h3>
        <p className={`text-sm text-gray-600 leading-relaxed ${!expanded && post.body.length > 150 ? 'line-clamp-3' : ''}`}>
          {post.body}
        </p>
        {post.body.length > 150 && (
          <button onClick={() => setExpanded(p => !p)} className="text-xs text-green-600 font-medium mt-1">
            {expanded ? 'Yığ ▲' : 'Daha çox ▼'}
          </button>
        )}
      </div>

      {post.photo_data && <img src={post.photo_data} alt="post" className="w-full max-h-64 object-cover" />}

      <div className="px-4 py-3 flex items-center gap-4 border-t border-gray-50">
        <button
          onClick={() => onLeaf(post.id)}
          className={`flex items-center gap-1.5 text-sm font-semibold transition-all active:scale-110 ${post.user_leafed ? 'text-green-600' : 'text-gray-400 hover:text-green-500'}`}
        >
          <span className={`text-xl ${post.user_leafed ? 'scale-110' : ''}`}>🍃</span>
          <span>{post.leaf_count}</span>
        </button>
        <button onClick={() => setExpanded(p => !p)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 font-medium">
          <span>💬</span>
          <span>{comments.length}</span>
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-50 px-4 pt-3 pb-4 space-y-3">
          {comments.map(c => (
            <div key={c.id} className="flex gap-2">
              <div className={`w-6 h-6 rounded-full ${avatarBg(c.username)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5`}>
                {c.username.slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                <span className="text-xs font-semibold text-gray-700">{c.username} </span>
                <span className="text-xs text-gray-600">{c.text}</span>
              </div>
            </div>
          ))}
          <form onSubmit={handleComment} className="flex gap-2 mt-2">
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Şərh yaz..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-green-400"
            />
            <button type="submit" disabled={posting || !commentText.trim()} className="px-3 py-2 bg-green-500 text-white text-xs font-bold rounded-xl disabled:opacity-40 hover:bg-green-600">
              {posting ? '...' : '→'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/* ─── Main SearchTab ─── */

interface SearchTabProps {
  onCreateRequest: () => void;
}

export default function SearchTab({ onCreateRequest }: SearchTabProps) {
  const { user } = useAuthStore();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: number; username: string } | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api.posts.list().then(setPosts).catch(() => {}).finally(() => setPostsLoading(false));
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(query), 350);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setSearchResults([]); return; }
    setSearching(true);
    api.users.search(debouncedQuery)
      .then(setSearchResults)
      .catch(() => setSearchResults([]))
      .finally(() => setSearching(false));
  }, [debouncedQuery]);

  const handleLeaf = async (id: number) => {
    try {
      const result = await api.posts.leaf(id);
      setPosts(prev => prev.map(p => p.id === id ? { ...p, leaf_count: result.leaf_count, user_leafed: result.user_leafed } : p));
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu paylaşımı silmək istəyirsiniz?')) return;
    try {
      await api.posts.delete(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch { /* ignore */ }
  };

  if (selectedUser) {
    return (
      <UserProfile
        userId={selectedUser.id}
        username={selectedUser.username}
        currentUserId={user?.id ?? 0}
        onBack={() => setSelectedUser(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex items-center gap-2">
        <span className="text-gray-400 text-lg">🔍</span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="İstifadəçi adı ilə axtar..."
          className="flex-1 text-sm focus:outline-none text-gray-700 placeholder-gray-400"
        />
        {query && <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>}
      </div>

      {/* Search results */}
      {debouncedQuery.trim() && (
        <div className="space-y-2">
          {searching ? (
            <div className="text-center py-4 text-gray-400 text-sm">Axtarılır...</div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">İstifadəçi tapılmadı</div>
          ) : (
            searchResults.map(u => (
              <UserCard key={u.id} user={u} onClick={() => setSelectedUser({ id: u.id, username: u.username })} />
            ))
          )}
        </div>
      )}

      {/* Feed posts */}
      {!debouncedQuery.trim() && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Anlık paylaşımlar</h2>
          </div>
          {postsLoading ? (
            <div className="text-center py-12 text-gray-400">Yüklənir...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🌿</div>
              <p className="text-gray-500 font-medium">Hələ paylaşım yoxdur</p>
              <button onClick={onCreateRequest} className="mt-4 px-6 py-2.5 bg-green-500 text-white rounded-xl font-semibold text-sm hover:bg-green-600">
                + Paylaş
              </button>
            </div>
          ) : (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id ?? 0}
                onLeaf={handleLeaf}
                onDelete={handleDelete}
                onUsernameClick={(id, username) => setSelectedUser({ id, username })}
              />
            ))
          )}
        </>
      )}
    </div>
  );
}
