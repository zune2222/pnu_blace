"use client";
import { useEffect } from "react";
import { AuthContextType, LoginCredentials } from "./types";
import { useAuthState } from "./use-auth-state";
import { useAuthActions } from "./use-auth-actions";
import { useAuthRouter } from "./use-auth-router";
import { authApi } from "../api/auth-api";

// 작은 hook들을 조합하는 컴포지션 hook
export const useAuth = (): AuthContextType => {
  const {
    authState,
    setAuthenticated,
    setUnauthenticated,
    setLoading,
    updateToken,
  } = useAuthState();
  const { redirectToHome, redirectToLogin } = useAuthRouter();

  const {
    login: loginAction,
    logout: logoutAction,
    refreshToken: refreshTokenAction,
  } = useAuthActions(
    setAuthenticated,
    setUnauthenticated,
    setLoading,
    updateToken
  );

  // 초기화만 담당 (한 번만 실행)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authApi.getCurrentToken();
        if (!token) {
          setUnauthenticated();
          return;
        }

        const isValid = await authApi.checkAuth();
        if (isValid) {
          setAuthenticated(null, token);
        } else {
          setUnauthenticated();
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        setUnauthenticated();
      }
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 의도적으로 한 번만 실행

  // 라우팅이 포함된 액션들
  const login = async (credentials: LoginCredentials) => {
    const response = await loginAction(credentials);
    redirectToHome();
    return response;
  };

  const logout = async () => {
    await logoutAction();
    redirectToLogin();
  };

  const refreshToken = async () => {
    return await refreshTokenAction();
  };

  return {
    ...authState,
    login,
    logout,
    refreshToken,
  };
};
