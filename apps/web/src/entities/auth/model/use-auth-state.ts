"use client";
import { useState } from "react";
import { AuthState } from "./types";

// 순수하게 인증 상태만 관리하는 hook
export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
  });

  const setAuthenticated = (user: AuthState["user"], token: string) => {
    setAuthState({
      isAuthenticated: true,
      user,
      token,
      isLoading: false,
    });
  };

  const setUnauthenticated = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
    });
  };

  const setLoading = (isLoading: boolean) => {
    setAuthState((prev) => ({ ...prev, isLoading }));
  };

  const updateToken = (token: string) => {
    setAuthState((prev) => ({ ...prev, token }));
  };

  return {
    authState,
    setAuthenticated,
    setUnauthenticated,
    setLoading,
    updateToken,
  };
};
