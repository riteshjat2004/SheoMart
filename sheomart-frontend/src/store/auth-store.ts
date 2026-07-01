import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getProfile } from "@/services/auth";
import type { AuthSessionPayload, AuthUser, UserRole } from "@/types/auth";

interface AuthState {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  loading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  login: (session: AuthSessionPayload) => void;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
  clearUser: () => void;
  setAccessToken: (token: string | null) => void;
  setLoading: (value: boolean) => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      isAuthenticated: false,
      loading: true,
      accessToken: null,
      refreshToken: null,
      login: (session) =>
        set({
          user: session.user,
          role: session.user.role,
          isAuthenticated: true,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          loading: false,
        }),
      logout: () =>
        set({
          user: null,
          role: null,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          loading: false,
        }),
      setUser: (user) => set({ user, role: user?.role ?? null, isAuthenticated: Boolean(user) }),
      clearUser: () => set({ user: null, role: null, isAuthenticated: false }),
      setAccessToken: (token) => set({ accessToken: token }),
      setLoading: (value) => set({ loading: value }),
      initializeAuth: async () => {
        const state = useAuthStore.getState();
        if (!state.accessToken) {
          set({ loading: false, isAuthenticated: false, user: null, role: null });
          return;
        }

        try {
          const profile = await getProfile();
          set({
            user: profile.user,
            role: profile.user.role,
            isAuthenticated: true,
            loading: false,
          });
        } catch {
          set({
            user: null,
            role: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            loading: false,
          });
        }
      },
    }),
    {
      name: "sheomart-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
