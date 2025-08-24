"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button, Input } from "@/shared/ui";

export const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식을 입력해주세요";
    }

    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요";
    } else if (formData.password.length < 6) {
      newErrors.password = "비밀번호는 최소 6자 이상이어야 합니다";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // TODO: Implement login logic
    console.log("Login attempt:", formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 py-12">
      <div className="w-full max-w-md">
        <div className="bg-background rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <h1 className="text-2xl font-bold text-primary">PNU Blace</h1>
            </Link>
            <h2 className="text-2xl font-semibold mb-2">로그인</h2>
            <p className="text-muted-foreground">
              계정에 로그인하여 서비스를 이용하세요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="이메일"
              type="email"
              name="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />

            <Input
              label="비밀번호"
              type="password"
              name="password"
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">
                  로그인 상태 유지
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                비밀번호 찾기
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg">
              로그인
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              계정이 없으신가요?{" "}
              <Link
                href="/register"
                className="text-primary hover:underline font-medium"
              >
                회원가입
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  또는
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button variant="outline" className="w-full" size="lg">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google로 로그인
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
