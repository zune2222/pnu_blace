"use client";
import { useState } from "react";
import { useLogin } from "@/features/auth";
import { validateLoginForm, isValidForm } from "../lib/validation";
import type { LoginFormData, LoginFormErrors } from "./types";

export const useLoginForm = () => {
  const { login, isLoading: authLoading } = useLogin();

  const [formData, setFormData] = useState<LoginFormData>({
    studentId: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState<LoginFormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Clear error when user starts typing
    if (errors[name as keyof LoginFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = validateLoginForm(formData);
    setErrors(newErrors);
    return isValidForm(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 클라이언트 사이드 유효성 검사
    if (!validateForm()) {
      return;
    }

    // 일반 에러 메시지 초기화
    setErrors((prev) => ({ ...prev, general: undefined }));

    try {
      await login({
        studentId: formData.studentId,
        password: formData.password,
      });
      // 로그인 성공 - useAuth에서 리다이렉트 처리
    } catch (error) {
      console.error("Login failed:", error);

      // 에러 메시지 설정
      const errorMessage =
        error instanceof Error
          ? error.message
          : "로그인에 실패했습니다. 다시 시도해주세요.";

      setErrors({ general: errorMessage });
    }
  };

  return {
    formData,
    errors,
    authLoading,
    handleChange,
    handleSubmit,
  };
};
