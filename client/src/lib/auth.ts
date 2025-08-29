import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (token, user) => set({
        token,
        user,
        isAuthenticated: true,
      }),
      
      logout: () => set({
        token: null,
        user: null,
        isAuthenticated: false,
      }),
    }),
    {
      name: 'lwg-auth-storage',
    }
  )
);
