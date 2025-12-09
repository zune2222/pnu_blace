"use client";
import React from "react";
import { useLoginForm } from "../model/use-login-form";

export const LoginForm: React.FC = () => {
  const { formData, errors, authLoading, handleChange, handleSubmit } =
    useLoginForm();

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        {errors.general && (
          <div className="text-center p-3 sm:p-4 text-red-100 bg-red-500/30 border border-red-400/50 rounded-xl text-sm leading-relaxed break-keep">
            {errors.general}
          </div>
        )}

        <div className="space-y-4 sm:space-y-5">
          {/* 아이디 입력 */}
          <div>
            <input
              type="text"
              name="studentId"
              placeholder="아이디"
              value={formData.studentId}
              onChange={handleChange}
              maxLength={9}
              pattern="[0-9]*"
              inputMode="numeric"
              required
              className="w-full px-5 sm:px-6 py-4 sm:py-5 bg-white/20 border-0 rounded-full text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/25 transition-all text-base sm:text-lg min-h-[44px]"
            />
            {errors.studentId && (
              <p className="text-red-300 text-xs mt-2 ml-4 sm:ml-6">{errors.studentId}</p>
            )}
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <input
              type="password"
              name="password"
              placeholder="비밀번호"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-5 sm:px-6 py-4 sm:py-5 bg-white/20 border-0 rounded-full text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/25 transition-all text-base sm:text-lg min-h-[44px]"
            />
            {errors.password && (
              <p className="text-red-300 text-xs mt-2 ml-4 sm:ml-6">{errors.password}</p>
            )}
          </div>
        </div>

        {/* 자동 로그인 체크박스 */}
        <div className="flex items-center justify-start px-2 sm:px-4">
          <label className="flex items-center space-x-3 cursor-pointer group min-h-[44px]">
            <div className="relative">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="peer sr-only"
              />
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 border-2 rounded-full transition-all duration-200 ease-in-out flex items-center justify-center
                  ${formData.rememberMe
                    ? 'bg-white border-white'
                    : 'bg-transparent border-white/50 group-hover:border-white/70'
                  }`}
              >
                {formData.rememberMe && (
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-[#004EA2]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-white/80 text-sm sm:text-base group-hover:text-white transition-colors">
              자동로그인
            </span>
          </label>
        </div>

        {/* 로그인 버튼 */}
        <div className="pt-6 sm:pt-8">
          <button
            type="submit"
            disabled={authLoading}
            className="w-full py-4 sm:py-5 bg-white text-[#004EA2] font-semibold text-base sm:text-lg rounded-xl hover:bg-white/95 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-black/10 min-h-[48px] active:scale-95"
          >
            {authLoading ? "로그인 중..." : "로그인"}
          </button>
        </div>
      </form>
    </div>
  );
};
