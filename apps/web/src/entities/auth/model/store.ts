"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthState } from "./types";

interface AuthStore extends AuthState {
  setAuthenticated: (user: AuthState["user"], token: string) => void;
  setUnauthenticated: () => void;
  setLoading: (loading: boolean) => void;
  updateToken: (token: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // 상태
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: true,

      // 상태 변경 액션들
      setAuthenticated: (user: AuthState["user"], token: string) => {
        set({
          isAuthenticated: true,
          user,
          token,
          isLoading: false,
        });
      },

      setUnauthenticated: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
        });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      updateToken: (token: string) => {
        set({ token });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
);