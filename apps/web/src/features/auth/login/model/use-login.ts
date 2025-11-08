"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/entities/auth";
import { LoginCredentials } from "@/entities/auth";

export const useLogin = () => {
  const { login: authLogin, isLoading } = useAuth();
  const router = useRouter();

  const login = async (credentials: LoginCredentials) => {
    try {
      await authLogin(credentials);
      router.push("/dashboard");
    } catch (error) {
      // 에러 발생시 네비게이션하지 않고 에러를 다시 throw
      throw error;
    }
  };

  return {
    login,
    isLoading,
  };
};