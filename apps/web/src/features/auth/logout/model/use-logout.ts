"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/entities/auth";

export const useLogout = () => {
  const { logout: authLogout } = useAuth();
  const router = useRouter();

  const logout = async () => {
    await authLogout();
    router.push("/login");
  };

  return {
    logout,
  };
};