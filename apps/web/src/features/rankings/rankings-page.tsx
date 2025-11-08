"use client";
import React, { useState } from "react";
import { RankingTabs } from "./ui/ranking-tabs";
import { AllTimeRankings } from "./ui/all-time-rankings";
import { WeeklyRankings } from "./ui/weekly-rankings";
import { MyRankingCard } from "./ui/my-ranking-card";
import { RankingPrivacySettings } from "./ui/ranking-privacy-settings";

type TabType = "all-time" | "weekly";

export const RankingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("all-time");

  return (
    <div className="min-h-screen bg-background">
      <section className="py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          {/* 페이지 헤더 */}
          <div className="space-y-8 mb-16">
            <div>
              <h1 className="text-4xl md:text-5xl font-extralight text-foreground leading-tight mb-4">
                도서관 랭킹
              </h1>
              <p className="text-lg text-muted-foreground/70 font-light">
                다른 사용자들과 함께하는 도서관 이용 경쟁
              </p>
            </div>
          </div>

          {/* 내 랭킹 정보 */}
          <div className="mb-16">
            <MyRankingCard />
          </div>

          {/* 랭킹 공개 설정 */}
          <div className="mb-16">
            <RankingPrivacySettings />
          </div>

          {/* 탭 네비게이션 */}
          <div className="mb-16">
            <RankingTabs 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
            />
          </div>

          {/* 랭킹 콘텐츠 */}
          <div>
            {activeTab === "all-time" ? (
              <AllTimeRankings />
            ) : (
              <WeeklyRankings />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};