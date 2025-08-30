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
            placeholder="202100000"
            value={formData.studentId}
            onChange={handleChange}
            error={errors.studentId}
            maxLength={9}
            pattern="[0-9]*"
            inputMode="numeric"
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
            <div className="relative">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="peer sr-only"
              />
              <div
                className={`w-5 h-5 border-2 rounded-md transition-all duration-200 ease-in-out
                  ${formData.rememberMe 
                    ? 'bg-foreground border-foreground shadow-lg shadow-foreground/25' 
                    : 'bg-background border-muted-foreground/50 group-hover:border-foreground/60 group-hover:bg-muted/20'
                  }
                  peer-focus:ring-2 peer-focus:ring-foreground/50 peer-focus:ring-offset-1`}
              >
                {formData.rememberMe && (
                  <svg 
                    className="w-3 h-3 text-background absolute inset-0 m-auto animate-in zoom-in duration-200" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-muted-foreground font-light group-hover:text-foreground transition-colors">
              아이디/비밀번호 기억하기
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
