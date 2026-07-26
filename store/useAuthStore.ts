import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  userEmail: string | null;
  userRole: string | null;
  isAuthenticated: boolean;
  setToken: (token: string, email?: string, role?: string) => void;
  setUser: (email: string, role?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userEmail: null,
      userRole: null,
      isAuthenticated: false,
      setToken: (token: string, email?: string, role?: string) =>
        set((state) => ({
          token,
          isAuthenticated: true,
          userEmail: email || state.userEmail,
          userRole: role || state.userRole,
        })),
      setUser: (email: string, role?: string) =>
        set({ userEmail: email, userRole: role || null }),
      logout: () => set({ token: null, userEmail: null, userRole: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // unique name for localStorage
    }
  )
);
