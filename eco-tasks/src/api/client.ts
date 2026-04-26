// Capacitor native app-da relative URL işləmir — tam ünvan lazımdır
const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

function getToken(): string | null {
  return localStorage.getItem('eco-token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Xəta baş verdi');
  return data as T;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  is_private?: number;
  phone_number?: string | null;
}

export interface DBCompletedTask {
  taskId: string;
  completedAt: string;
}

export interface DBDayRecord {
  date: string;
  completedTasks: DBCompletedTask[];
}

export interface LeaderboardEntry {
  userId: number;
  username: string;
  totalXal: number;
  taskCount: number;
  resolvedProblems: number;
  isCurrentUser: boolean;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  currentUserRank: number;
  totalUsers?: number;
}

export interface PostComment {
  id: number;
  post_id: number;
  user_id: number;
  username: string;
  text: string;
  created_at: string;
}

export interface Post {
  id: number;
  user_id: number;
  username: string;
  title: string;
  body: string;
  photo_data: string | null;
  leaf_count: number;
  user_leafed: boolean;
  created_at: string;
  comments: PostComment[];
}

export interface UserSearchResult {
  id: number;
  username: string;
  isPrivate: boolean;
  totalXal: number;
  taskCount: number;
  resolvedProblems: number;
  isCurrentUser: boolean;
  isFollowing: boolean;
  isPendingFollow: boolean;
}

export interface UserStats {
  id: number;
  username: string;
  isPrivate: boolean;
  phoneNumber: string | null;
  totalXal: number;
  taskCount: number;
  resolvedProblems: number;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  isPendingFollow: boolean;
  isCurrentUser: boolean;
  posts: Post[];
}

export interface AppNotification {
  id: number;
  user_id: number;
  type: 'follow_request' | 'follow_accepted' | 'new_follower' | 'problem_claimed' | 'problem_resolved';
  actor_id: number;
  actor_username: string;
  ref_id: number | null;
  data: Record<string, unknown> | null;
  is_read: number;
  created_at: string;
}

export interface EcoProblem {
  id: number;
  title: string;
  description: string;
  location: string;
  lat: number | null;
  lng: number | null;
  photo_data: string | null;
  reporter_id: number;
  reporter_username: string;
  claimer_id: number | null;
  claimer_username: string | null;
  resolver_id: number | null;
  resolver_username: string | null;
  status: 'reported' | 'claimed' | 'resolved';
  created_at: string;
  claimed_at: string | null;
  resolved_at: string | null;
  resolution_photo: string | null;
}

export const api = {
  auth: {
    register: (username: string, email: string, password: string) =>
      request<{ token: string; user: AuthUser }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      }),
    login: (email: string, password: string) =>
      request<{ token: string; user: AuthUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
  },
  tasks: {
    history: () => request<DBDayRecord[]>('/tasks/history'),
    complete: (date: string, taskId: string, completedAt: string) =>
      request<{ success: boolean }>('/tasks/complete', {
        method: 'POST',
        body: JSON.stringify({ date, taskId, completedAt }),
      }),
  },
  prizes: {
    list: () => request<string[]>('/prizes'),
    redeem: (prizeId: string) =>
      request<{ success: boolean }>('/prizes/redeem', {
        method: 'POST',
        body: JSON.stringify({ prizeId }),
      }),
  },
  leaderboard: {
    get: () => request<LeaderboardResponse>('/leaderboard'),
  },
  posts: {
    list: () => request<Post[]>('/posts'),
    create: (data: { title: string; body: string; photo_data?: string }) =>
      request<Post>('/posts', { method: 'POST', body: JSON.stringify(data) }),
    leaf: (id: number) =>
      request<{ leaf_count: number; user_leafed: boolean }>(`/posts/${id}/leaf`, { method: 'POST' }),
    comment: (id: number, text: string) =>
      request<PostComment>(`/posts/${id}/comments`, { method: 'POST', body: JSON.stringify({ text }) }),
    delete: (id: number) =>
      request<{ success: boolean }>(`/posts/${id}`, { method: 'DELETE' }),
  },
  users: {
    search: (q: string) =>
      request<UserSearchResult[]>(`/users/search?q=${encodeURIComponent(q)}`),
    stats: (id: number) =>
      request<UserStats>(`/users/${id}/stats`),
    updateMe: (data: { phone_number?: string; is_private?: boolean }) =>
      request<AuthUser>('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
    follow: (id: number) =>
      request<{ isFollowing: boolean; isPendingFollow: boolean; followerCount: number }>(`/users/${id}/follow`, { method: 'POST' }),
    approveFollow: (id: number) =>
      request<{ success: boolean }>(`/users/${id}/follow/approve`, { method: 'POST' }),
    declineFollow: (id: number) =>
      request<{ success: boolean }>(`/users/${id}/follow/decline`, { method: 'POST' }),
  },
  notifications: {
    list: () => request<AppNotification[]>('/notifications'),
    readAll: () => request<{ success: boolean }>('/notifications/read-all', { method: 'PUT' }),
    readOne: (id: number) => request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PUT' }),
  },
  problems: {
    list: () => request<EcoProblem[]>('/problems'),
    report: (data: { title: string; description: string; location: string; photo_data?: string; lat?: number; lng?: number }) =>
      request<EcoProblem>('/problems', { method: 'POST', body: JSON.stringify(data) }),
    claim: (id: number) =>
      request<EcoProblem>(`/problems/${id}/claim`, { method: 'PUT' }),
    resolve: (id: number, resolution_photo?: string) =>
      request<EcoProblem>(`/problems/${id}/resolve`, {
        method: 'PUT',
        body: JSON.stringify({ resolution_photo }),
      }),
    delete: (id: number) =>
      request<{ success: boolean }>(`/problems/${id}`, { method: 'DELETE' }),
  },
};
