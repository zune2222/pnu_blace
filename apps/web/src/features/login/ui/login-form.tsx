"use client";
import React from "react";
import { Button, Input } from "@/shared/ui";
import { useLoginForm } from "../model/use-login-form";

export const LoginForm: React.FC = () => {
  const { formData, errors, authLoading, handleChange, handleSubmit } =
    useLoginForm();

  return (
    <div className="max-w-sm mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {errors.general && (
          <div className="text-center p-4 text-red-600 bg-red-50 border border-red-200 rounded-lg font-light">
            {errors.general}
          </div>
        )}

        <div className="space-y-6">
          <Input
            label="학번"
            type="text"
            name="studentId"
            placeholder="2021000000"
            value={formData.studentId}
            onChange={handleChange}
            error={errors.studentId}
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
        </div>

        <div className="flex items-center justify-center">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 rounded border-2 border-muted-foreground/30 text-foreground focus:ring-2 focus:ring-foreground/20 transition-all"
            />
            <span className="text-muted-foreground font-light group-hover:text-foreground transition-colors">
              로그인 상태 유지
            </span>
          </label>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full bg-foreground text-background hover:bg-foreground/90 border-0 rounded-lg font-medium text-lg py-4 transition-all duration-200 hover:scale-[1.02]"
            disabled={authLoading}
          >
            <span className="variable-weight-hover">
              {authLoading ? "로그인 중..." : "로그인"}
            </span>
          </Button>
        </div>
      </form>
    </div>
  );
};
