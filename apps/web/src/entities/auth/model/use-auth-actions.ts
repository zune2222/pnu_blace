"use client";
import { useCallback } from "react";
import { authApi } from "../api/auth-api";
import { LoginCredentials, AuthState } from "./types";

export const useAuthActions = (
  setAuthenticated: (user: AuthState["user"], token: string) => void,
  setUnauthenticated: () => void,
  setLoading: (loading: boolean) => void,
  updateToken: (token: string) => void
) => {
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setLoading(true);
      try {
        const response = await authApi.login(credentials);

        // TODO: JWT 디코딩 또는 별도 API로 사용자 정보 가져오기
        const user = {
          studentId: credentials.studentId,
          // name, major 등은 JWT에서 추출하거나 별도 API 호출
        };

        setAuthenticated(user, response.accessToken);
        return response;
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [setAuthenticated, setLoading]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      setUnauthenticated();
    }
  }, [setUnauthenticated]);

  const refreshToken = useCallback(async () => {
    try {
      const response = await authApi.refreshToken();
      updateToken(response.accessToken);
      return response.accessToken;
    } catch (error) {
      // 토큰 갱신 실패시 로그아웃
      setUnauthenticated();
      throw error;
    }
  }, [updateToken, setUnauthenticated]);

  return {
    login,
    logout,
    refreshToken,
  };
};
