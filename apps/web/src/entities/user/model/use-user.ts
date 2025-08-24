"use client";
import { useState, useEffect } from "react";
import { UserState, UserProfile } from "./types";
import { userApi } from "../api/user-api";

export const useUser = (token: string | null) => {
  const [userState, setUserState] = useState<UserState>({
    profile: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!token) {
      setUserState({
        profile: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    const fetchProfile = async () => {
      setUserState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const profile = await userApi.getProfile(token);
        setUserState({
          profile,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setUserState({
          profile: null,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다",
        });
      }
    };

    fetchProfile();
  }, [token]);

  const refetchProfile = async () => {
    if (!token) return;

    setUserState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const profile = await userApi.getProfile(token);
      setUserState({
        profile,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setUserState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다",
      }));
    }
  };

  return {
    ...userState,
    refetchProfile,
  };
};
