"use client";
import { useState } from "react";
import { useAuth } from "@/entities/auth";
import { validateLoginForm, isValidForm } from "../lib/validation";
import type { LoginFormData, LoginFormErrors } from "./types";

export const useLoginForm = () => {
  const { login, isLoading: authLoading } = useAuth();

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

    if (!validateForm()) {
      return;
    }

    try {
      await login({
        studentId: formData.studentId,
        password: formData.password,
      });
      // Login successful - redirect will be handled by auth context or parent component
    } catch (error) {
      console.error("Login failed:", error);
      setErrors({ general: "로그인에 실패했습니다. 다시 시도해주세요." });
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
