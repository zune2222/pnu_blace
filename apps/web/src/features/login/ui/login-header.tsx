"use client";
import React from "react";
import Image from "next/image";

export const LoginHeader: React.FC = () => {
  return (
    <div className="text-center mb-10">
      {/* 로고 영역 */}
      <div className="mb-6">
        <Image
          src="/pnu_logo_trans.png"
          alt="PNU Blace 로고"
          width={100}
          height={100}
          className="mx-auto mb-4"
        />
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          PNU Blace
        </h1>
        <p className="text-white/90 text-lg mt-1">부산대학교 도서관</p>
      </div>

      {/* 안내 문구 */}
      <p className="text-white/70 text-sm">
        아이디와 비밀번호는 부산대학교 홈페이지와 동일합니다
      </p>
    </div>
  );
};
