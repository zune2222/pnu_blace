"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "@/features/auth";
import { useJoinWithInviteCode } from "@/entities/study";

export const StudyJoinPage: React.FC = () => {
  const router = useRouter();
  const joinMutation = useJoinWithInviteCode();

  const [inviteCode, setInviteCode] = useState("");
  const [displayName, setDisplayName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteCode.trim()) {
      alert("초대 코드를 입력해주세요.");
      return;
    }

    if (!displayName.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    try {
      const result = await joinMutation.mutateAsync({
        inviteCode: inviteCode.trim().toUpperCase(),
        displayName: displayName.trim(),
      });

      alert("스터디에 가입되었습니다!");
      router.push(`/study/${result.data?.groupId || ""}`);
    } catch (error: any) {
      alert(error.message || "가입에 실패했습니다.");
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto px-6 py-12">
          <Link
            href="/study"
            className="text-sm text-muted-foreground/60 hover:text-foreground font-light mb-6 inline-block"
          >
            ← 스터디 목록
          </Link>

          <h1 className="text-3xl font-extralight text-foreground mb-2">
            초대 코드로 가입
          </h1>
          <p className="text-lg text-muted-foreground/70 font-light mb-8">
            스터디 초대 코드를 입력하세요
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-muted-foreground/60 font-light mb-2">
                초대 코드
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="예: ABC12345"
                maxLength={8}
                className="w-full px-4 py-3 bg-muted-foreground/5 border border-border/20 rounded-lg text-foreground text-center text-xl tracking-widest placeholder:text-muted-foreground/40 focus:outline-none focus:border-border/40 font-light uppercase"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground/60 font-light mb-2">
                스터디 내 닉네임
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="스터디에서 사용할 닉네임"
                maxLength={50}
                className="w-full px-4 py-3 bg-muted-foreground/5 border border-border/20 rounded-lg text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border/40 font-light"
              />
            </div>

            <button
              type="submit"
              disabled={joinMutation.isPending}
              className="w-full px-6 py-3 bg-foreground text-background rounded-lg text-sm font-light hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              {joinMutation.isPending ? "가입 중..." : "가입하기"}
            </button>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
};
