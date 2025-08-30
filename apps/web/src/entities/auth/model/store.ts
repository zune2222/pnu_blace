"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthState } from "./types";

interface AuthStore extends AuthState {
  setAuthenticated: (user: AuthState["user"], token: string) => void;
  setUnauthenticated: () => void;
  setLoading: (loading: boolean) => void;
  updateToken: (token: string) => void;
  logout: () => void;
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

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
        });
        
        // 로컬스토리지에서 토큰 제거
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
          // 로그인 페이지로 리다이렉트
          window.location.href = "/login";
        }
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