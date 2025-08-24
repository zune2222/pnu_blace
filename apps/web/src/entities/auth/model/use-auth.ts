"use client";
import { useState, useEffect, useCallback } from "react";
import { AuthState, LoginCredentials, AuthContextType } from "./types";
import { authApi } from "../api/auth-api";

const STORAGE_KEY = "auth_token";

export const useAuth = (): AuthContextType => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY);
    if (token) {
      try {
        // TODO: Validate token and get user info
        // For now, just set as authenticated
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: true,
          token,
          isLoading: false,
        }));
      } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const response = await authApi.login(credentials);

      // Store token
      localStorage.setItem(STORAGE_KEY, response.accessToken);

      // TODO: Decode JWT to get user info
      const user = {
        studentId: credentials.studentId,
        // name and major should come from JWT or separate API call
      };

      setAuthState({
        isAuthenticated: true,
        user,
        token: response.accessToken,
        isLoading: false,
      });
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
    });
  }, []);

  const refreshToken = useCallback(async () => {
    if (!authState.token) return;

    try {
      const response = await authApi.refreshToken(authState.token);
      localStorage.setItem(STORAGE_KEY, response.accessToken);

      setAuthState((prev) => ({
        ...prev,
        token: response.accessToken,
      }));
    } catch (error) {
      logout();
      throw error;
    }
  }, [authState.token, logout]);

  return {
    ...authState,
    login,
    logout,
    refreshToken,
  };
};
