"use client";
import React from "react";
import Link from "next/link";

export const LoginHeader: React.FC = () => {
  return (
    <div className="text-center mb-16">
      <Link href="/" className="inline-block mb-12 group">
        <h1 className="text-6xl md:text-7xl font-black text-foreground dynamic-weight cursor-pointer">
          PNU Blace
        </h1>
      </Link>
      <div className="space-y-6">
        <h2 className="text-4xl md:text-5xl font-light text-foreground variable-weight-hover cursor-default">
          로그인
        </h2>
        <p className="text-lg text-muted-foreground font-light leading-relaxed max-w-md mx-auto">
          부산대학교 도서관 좌석 시스템에
          <br />
          로그인하여 시작하세요
        </p>
      </div>
    </div>
  );
};
