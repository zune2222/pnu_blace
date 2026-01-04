"use client";
import { useState, useEffect, useRef } from "react";
import { useLogin } from "@/features/auth";
import { validateLoginForm, isValidForm } from "../lib/validation";
import { SavedCredentials } from "../lib/saved-credentials";
import { authEvents, formEvents } from "@/shared/lib/analytics";
import type { LoginFormData, LoginFormErrors } from "./types";

export const useLoginForm = () => {
  const { login, isLoading: authLoading } = useLogin();
  const formStartTimeRef = useRef<number>(0);
  const hasStartedRef = useRef(false);

  const [formData, setFormData] = useState<LoginFormData>({
    studentId: "",
    password: "",
    rememberMe: false,
  });

  useEffect(() => {
    const savedCredentials = SavedCredentials.load();
    if (savedCredentials) {
      setFormData(prev => ({
        ...prev,
        studentId: savedCredentials.studentId,
        password: savedCredentials.password,
        rememberMe: true,
      }));
    }
  }, []);

  const [errors, setErrors] = useState<LoginFormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    // 첫 입력 시 폼 시작 추적
    if (!hasStartedRef.current && (name === "studentId" || name === "password") && value) {
      hasStartedRef.current = true;
      formStartTimeRef.current = Date.now();
      formEvents.started("login");
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    if (name === "rememberMe" && !checked) {
      SavedCredentials.remove();
    }

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
      formEvents.fieldError("login", "validation", "client_validation_failed");
      return;
    }

    // 일반 에러 메시지 초기화
    setErrors((prev) => ({ ...prev, general: undefined }));

    try {
      await login({
        studentId: formData.studentId,
        password: formData.password,
      });

      // 로그인 성공 추적
      const durationSeconds = formStartTimeRef.current
        ? Math.round((Date.now() - formStartTimeRef.current) / 1000)
        : 0;
      formEvents.submitted("login", durationSeconds);
      authEvents.login({ method: "credentials", success: true });

      // 사용자 식별
      authEvents.identify(formData.studentId, {
        user_type: "authenticated",
        student_id: formData.studentId,
        platform: "web",
        theme_preference: "system",
      });

      if (formData.rememberMe) {
        SavedCredentials.save(formData.studentId, formData.password);
      }

    } catch (error) {
      // 로그인 실패 추적
      let errorType: "invalid_credentials" | "rate_limited" | "server_error" | "network_error" = "server_error";
      const errorMessage = error instanceof Error ? error.message : "로그인에 실패했습니다.";

      if (errorMessage.includes("401") || errorMessage.includes("인증")) {
        errorType = "invalid_credentials";
      } else if (errorMessage.includes("429") || errorMessage.includes("너무 많은")) {
        errorType = "rate_limited";
      } else if (errorMessage.includes("network") || errorMessage.includes("네트워크")) {
        errorType = "network_error";
      }

      authEvents.login({ method: "credentials", success: false, error_type: errorType });

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
