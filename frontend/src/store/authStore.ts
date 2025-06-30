import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Tokens } from "../types";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  user: User | null;
  login: (tokens: Tokens) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      user: null,
      login: (tokens: Tokens) => {
        set({
          accessToken: tokens.access,
          refreshToken: tokens.refresh,
          isAuthenticated: true,
        });
      },
      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          user: null,
        });
      },
      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: "auth-storage", // name of the item in the storage (must be unique)
    },
  ),
);
