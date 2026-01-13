"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/entities/auth";
import { useMyRankInfo } from "@/entities/rankings";
import { RankingTabs } from "./ui/ranking-tabs";
import { AllTimeRankings } from "./ui/all-time-rankings";
import { WeeklyRankings } from "./ui/weekly-rankings";
import { MyRankingCard } from "./ui/my-ranking-card";
import { RankingPrivacySettings } from "./ui/ranking-privacy-settings";
import { ShareStoryButton } from "@/features/share";

type TabType = "all-time" | "weekly";

export const RankingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("all-time");
  const { isAuthenticated } = useAuth();
  
  // 로그인 사용자의 닉네임 가져오기 (React Query 활용)
  const { data: myRankData } = useMyRankInfo();
  const myNickname = myRankData?.publicNickname || null;

  return (
    <div className="min-h-screen bg-background">
      <section className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* 페이지 헤더 */}
          <div className="space-y-8 mb-16">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-4xl md:text-5xl font-extralight text-foreground leading-tight">
                  도서관 랭킹
                </h1>
                {isAuthenticated && (
                  <ShareStoryButton cardVariant="ranking" buttonVariant="text" />
                )}
              </div>
              <p className="text-lg text-muted-foreground/70 font-light">
                다른 사용자들과 함께하는 도서관 이용 경쟁
              </p>
            </div>
          </div>

          {/* 내 랭킹 정보 - 로그인 시에만 */}
          <div className="mb-16">
            {isAuthenticated ? (
              <MyRankingCard />
            ) : (
              <div className="space-y-8">
                <h2 className="text-2xl font-light text-foreground">내 랭킹</h2>
                <div className="border border-border/20 rounded-lg p-8 text-center space-y-4">
                  <p className="text-muted-foreground/70 font-light">
                    로그인하면 나의 랭킹을 확인할 수 있어요
                  </p>
                  <Link
                    href="/login"
                    className="inline-block px-6 py-2 bg-foreground text-background rounded-lg text-sm font-light hover:bg-foreground/90 transition-colors"
                  >
                    로그인하기
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 랭킹 닉네임 설정 - 로그인 시에만 */}
          {isAuthenticated && (
            <div className="mb-16">
              <RankingPrivacySettings />
            </div>
          )}

          {/* 탭 네비게이션 */}
          <div className="mb-16">
            <RankingTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* 랭킹 콘텐츠 - 항상 표시 */}
          <div>
            {activeTab === "all-time" ? (
              <AllTimeRankings myNickname={myNickname} />
            ) : (
              <WeeklyRankings myNickname={myNickname} />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
