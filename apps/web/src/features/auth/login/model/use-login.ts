"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/entities/auth";
import { LoginCredentials } from "@/entities/auth";

export const useLogin = () => {
  const { login: authLogin, isLoading } = useAuth();
  const router = useRouter();

  const login = async (credentials: LoginCredentials) => {
    await authLogin(credentials);
    router.push("/dashboard");
  };

  return {
    login,
    isLoading,
  };
};