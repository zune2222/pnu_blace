"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";

// 인증 관련 라우팅만 관리하는 hook
export const useAuthRouter = () => {
  const router = useRouter();

  const redirectToHome = useCallback(() => {
    router.push("/");
  }, [router]);

  const redirectToLogin = useCallback(() => {
    router.push("/login");
  }, [router]);

  return {
    redirectToHome,
    redirectToLogin,
  };
};
