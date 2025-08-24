"use client";
import { useAuthStore } from "./store";

export const useAuthSelectors = () => {
  const {
    isAuthenticated,
    user,
    token,
    isLoading,
  } = useAuthStore();

  return {
    isAuthenticated,
    user,
    token,
    isLoading,
  };
};