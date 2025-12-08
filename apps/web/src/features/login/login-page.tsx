"use client";
import React from "react";
import { LoginHeader, LoginForm, SecurityNotice } from "./ui";

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* 그라데이션 배경 */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            180deg,
            #1a6fc4 0%,
            #1a6fc4 25%,
            #3d8fd9 45%,
            #5ba3e0 60%,
            #89c4f4 75%,
            #d4e8f9 88%,
            #ffffff 100%
          )`,
        }}
      />

      {/* 메인 로그인 영역 */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md">
          <LoginHeader />
          <LoginForm />
          <SecurityNotice />
        </div>
      </div>
    </div>
  );
};
