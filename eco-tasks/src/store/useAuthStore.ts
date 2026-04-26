import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, type AuthUser } from '../api/client';

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      login: async (email, password) => {
        const { token, user } = await api.auth.login(email, password);
        localStorage.setItem('eco-token', token);
        set({ user, token });
      },

      register: async (username, email, password) => {
        const { token, user } = await api.auth.register(username, email, password);
        localStorage.setItem('eco-token', token);
        set({ user, token });
      },

      logout: () => {
        localStorage.removeItem('eco-token');
        set({ user: null, token: null });
      },
    }),
    { name: 'eco-auth' }
  )
);
