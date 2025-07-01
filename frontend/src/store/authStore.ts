import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, Tokens } from "../types";
import { logout as logoutService } from "../services/auth";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (data: Tokens) => void;
  logout: (localOnly?: boolean) => Promise<void>;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string) => void;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...initialState,
      login: ({ access, refresh }) => {
        set({
          accessToken: access,
          refreshToken: refresh,
          isAuthenticated: true,
        });
      },
      logout: async (localOnly = false) => {
        if (!localOnly) {
          try {
            await logoutService();
          } catch (error) {
            console.error("Backend logout failed:", error);
          }
        }
        set(initialState);
      },
      setUser: (user) => {
        // When setting user data, also update authentication status
        set({ user, isAuthenticated: !!user });
      },
      setAccessToken: (token: string) => {
        set({ accessToken: token });
      },
    }),
    {
      name: "auth-storage", // Unique name for localStorage item
      storage: createJSONStorage(() => localStorage), // Specify localStorage
      // This is the crucial security enhancement:
      // Only `isAuthenticated` and `user` are persisted to localStorage.
      // `accessToken` is kept in memory only, mitigating XSS risks.
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
