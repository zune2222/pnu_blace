"use client";
import { AuthManager } from "../lib/auth-manager";
import { TokenManager } from "../lib/token-manager";
import { useAuthStore } from "./store";
import { LoginCredentials } from "./types";

export const useAuthActions = () => {
  const {
    setAuthenticated,
    setUnauthenticated,
    setLoading,
    updateToken,
  } = useAuthStore();

  const initialize = async () => {
    try {
      const result = await AuthManager.initialize();
      if (result.isAuthenticated) {
        setAuthenticated(result.user, result.token!);
      } else {
        setUnauthenticated();
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);
      setUnauthenticated();
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const result = await AuthManager.login(credentials);
      setAuthenticated(result.user, result.token);
      
      // Notify native app about successful login to trigger token sync
      if (typeof window !== 'undefined' && (window as any).isNativeApp) {
        (window as any).sendToNative('LOGIN_SUCCESS');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    await AuthManager.logout();
    setUnauthenticated();
  };

  const refreshToken = async () => {
    try {
      const newToken = await TokenManager.refreshToken();
      updateToken(newToken);
      return newToken;
    } catch (error) {
      setUnauthenticated();
      throw error;
    }
  };

  return {
    initialize,
    login,
    logout,
    refreshToken,
  };
};