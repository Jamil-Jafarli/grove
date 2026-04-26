import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import type { Post } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

function timeAgo(dateStr: string): string {
  const s = dateStr.replace(' ', 'T');
  const diff = (Date.now() - new Date(s.endsWith('Z') ? s : s + 'Z').getTime()) / 1000;
  if (diff < 60) return 'indi';
  if (diff < 3600) return `${Math.floor(diff / 60)} dəq. əvvəl`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat əvvəl`;
  return `${Math.floor(diff / 86400)} gün əvvəl`;
}

interface CreateModalProps {
  onClose: () => void;
  onCreated: (post: Post) => void;
}

export function CreatePostModal({ onClose, onCreated }: CreateModalProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [photoData, setPhotoData] = useState<string | undefined>();
  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target?.result as string;
      setPhotoData(url);
      setPhotoPreview(url);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) { setError('Başlıq və mətn tələb olunur'); return; }
    setSubmitting(true); setError('');
    try {
      const post = await api.posts.create({ title: title.trim(), body: body.trim(), photo_data: photoData });
      onCreated(post);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Xəta');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white rounded-t-3xl p-5 pb-8 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Yeni Məqalə</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Başlıq..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400"
          />
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Ekoloji mövzuda paylaşmaq istədiklərini yaz..."
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 resize-none"
          />

          {photoPreview ? (
            <div className="relative">
              <img src={photoPreview} alt="preview" className="w-full h-36 object-cover rounded-xl" />
              <button
                type="button"
                onClick={() => { setPhotoData(undefined); setPhotoPreview(undefined); }}
                className="absolute top-2 right-2 bg-white rounded-full w-7 h-7 text-xs border border-gray-200 shadow flex items-center justify-center"
              >✕</button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:border-green-300 transition-colors"
            >
              🖼️ Şəkil əlavə et (ixtiyari)
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />

          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Göndərilir...' : '🌿 Paylaş'}
          </button>
        </form>
      </div>
    </div>
  );
}

interface PostCardProps {
  post: Post;
  currentUserId: number;
  onLeaf: (id: number) => void;
  onDelete: (id: number) => void;
}

function PostCard({ post, currentUserId, onLeaf, onDelete }: PostCardProps) {
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
    } catch { /* ignore */ } finally {
      setPosting(false);
    }
  };

  const avatarBg = (name: string) => {
    const colors = ['bg-green-500','bg-emerald-500','bg-teal-500','bg-cyan-500','bg-blue-500'];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
    return colors[Math.abs(h) % colors.length];
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-8 h-8 rounded-full ${avatarBg(post.username)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
            {post.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-800">{post.username}</div>
            <div className="text-xs text-gray-400">{timeAgo(post.created_at)}</div>
          </div>
          {post.user_id === currentUserId && (
            <button
              onClick={() => onDelete(post.id)}
              className="text-gray-300 hover:text-red-400 text-sm px-1 transition-colors"
            >🗑</button>
          )}
        </div>

        <h3 className="font-bold text-gray-800 text-base leading-tight mb-1">{post.title}</h3>
        <p className={`text-sm text-gray-600 leading-relaxed ${!expanded && post.body.length > 150 ? 'line-clamp-3' : ''}`}>
          {post.body}
        </p>
        {post.body.length > 150 && (
          <button
            onClick={() => setExpanded(p => !p)}
            className="text-xs text-green-600 font-medium mt-1"
          >
            {expanded ? 'Yığ ▲' : 'Daha çox ▼'}
          </button>
        )}
      </div>

      {post.photo_data && (
        <img src={post.photo_data} alt="post" className="w-full max-h-64 object-cover" />
      )}

      {/* Actions */}
      <div className="px-4 py-3 flex items-center gap-4 border-t border-gray-50">
        <button
          onClick={() => onLeaf(post.id)}
          className={`flex items-center gap-1.5 text-sm font-semibold transition-all active:scale-110 ${
            post.user_leafed ? 'text-green-600' : 'text-gray-400 hover:text-green-500'
          }`}
        >
          <span className={`text-xl transition-transform ${post.user_leafed ? 'scale-110' : ''}`}>🍃</span>
          <span>{post.leaf_count}</span>
        </button>

        <button
          onClick={() => setExpanded(p => !p)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
        >
          <span>💬</span>
          <span>{comments.length}</span>
        </button>
      </div>

      {/* Comments */}
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
            <button
              type="submit"
              disabled={posting || !commentText.trim()}
              className="px-3 py-2 bg-green-500 text-white text-xs font-bold rounded-xl disabled:opacity-40 hover:bg-green-600 transition-colors"
            >
              {posting ? '...' : '→'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

interface FeedProps {
  onCreateRequest: () => void;
}

export default function Feed({ onCreateRequest }: FeedProps) {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.posts.list()
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLeaf = async (id: number) => {
    try {
      const result = await api.posts.leaf(id);
      setPosts(prev => prev.map(p =>
        p.id === id ? { ...p, leaf_count: result.leaf_count, user_leafed: result.user_leafed } : p
      ));
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu məqaləni silmək istəyirsiniz?')) return;
    try {
      await api.posts.delete(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch { /* ignore */ }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Yüklənir...</div>;

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🌿</div>
          <p className="text-gray-500 font-medium">Hələ ki, məqalə yoxdur</p>
          <p className="text-gray-400 text-sm mt-1">İlk ekoloji məqaləni sən yaz!</p>
          <button
            onClick={onCreateRequest}
            className="mt-4 px-6 py-2.5 bg-green-500 text-white rounded-xl font-semibold text-sm hover:bg-green-600 transition-colors"
          >
            + Məqalə yaz
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
          />
        ))
      )}
    </div>
  );
}
