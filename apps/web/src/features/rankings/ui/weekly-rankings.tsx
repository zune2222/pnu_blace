"use client";
import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

interface WeeklyRankingUser {
  rank: number;
  publicNickname: string;
  weeklyHours: number;
  weeklySessions: number;
  weeklyDays: number;
  tier: string;
}

interface WeeklyRankingsData {
  weekStart: string;
  weekEnd: string;
  hoursRanking: WeeklyRankingUser[];
  sessionsRanking: WeeklyRankingUser[];
  daysRanking: WeeklyRankingUser[];
  pagination: {
    page: number;
    limit: number;
    totalPages: {
      hours: number;
      sessions: number;
      days: number;
    };
    totalItems: {
      hours: number;
      sessions: number;
      days: number;
    };
  };
}

type RankingType = "hours" | "sessions" | "days";

export const WeeklyRankings: React.FC = () => {
  const [rankings, setRankings] = useState<WeeklyRankingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRanking, setActiveRanking] = useState<RankingType>("hours");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchRankings = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.publicGet<WeeklyRankingsData>(
          `/api/v1/stats/rankings/weekly?page=${currentPage}&limit=20`
        );
        setRankings(response);
      } catch (error) {
        console.error("주간 랭킹 조회 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankings();
  }, [currentPage]);

  const getTierDisplay = (tier: string) => {
    const tierIcons: Record<string, React.ReactElement> = {
      Explorer: (
        <svg
          className="w-4 h-4 inline-block mr-2"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
      ),
      Student: (
        <svg
          className="w-4 h-4 inline-block mr-2"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
        </svg>
      ),
      Scholar: (
        <svg
          className="w-4 h-4 inline-block mr-2"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
        </svg>
      ),
      Master: (
        <svg
          className="w-4 h-4 inline-block mr-2"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M7 4V2c0-0.55-0.45-1-1-1S5 1.45 5 2v2C3.34 4.56 2.56 6.33 2.56 8.5S3.34 12.44 5 13v7c0 0.55 0.45 1 1 1s1-0.45 1-1v-7c1.66-0.56 2.44-2.33 2.44-4.5S8.66 4.56 7 4zm5-2v2c0 0.55 0.45 1 1 1s1-0.45 1-1V2c1.66 0.56 2.44 2.33 2.44 4.5S16.66 10.44 15 11v9c0 0.55 0.45 1 1 1s1-0.45 1-1v-9c1.66-0.56 2.44-2.33 2.44-4.5S18.66 2.56 17 2c0-0.55-0.45-1-1-1s-1 0.45-1 1z" />
        </svg>
      ),
      Legend: (
        <svg
          className="w-4 h-4 inline-block mr-2"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2.7-2h8.6l.9-5.4-2.1 1.4L12 8l-3.1 2L6.8 8.6L7.7 14z" />
        </svg>
      ),
      Myth: (
        <svg
          className="w-4 h-4 inline-block mr-2"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M7 2v11h3v9l7-12h-4l4-8z" />
        </svg>
      ),
    };

    return (
      <span className="flex items-center">
        {tierIcons[tier] || tierIcons.Student}
        {tier}
      </span>
    );
  };

  const formatValue = (type: RankingType, value: any) => {
    const numValue = parseFloat(value) || 0;

    switch (type) {
      case "hours":
        return `${numValue.toFixed(1)}시간`;
      case "sessions":
        return `${Math.round(numValue)}회`;
      case "days":
        return `${Math.round(numValue)}일`;
      default:
        return numValue.toString();
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
    });
  };

  const getCurrentRankingData = () => {
    if (!rankings) return [];
    switch (activeRanking) {
      case "hours":
        return rankings.hoursRanking;
      case "sessions":
        return rankings.sessionsRanking;
      case "days":
        return rankings.daysRanking;
      default:
        return [];
    }
  };

  const getCurrentValue = (user: WeeklyRankingUser) => {
    switch (activeRanking) {
      case "hours":
        return user.weeklyHours;
      case "sessions":
        return user.weeklySessions;
      case "days":
        return user.weeklyDays;
      default:
        return 0;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-muted-foreground/10 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!rankings) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground/60 font-light">
          주간 랭킹 정보를 불러올 수 없습니다.
        </p>
      </div>
    );
  }

  const currentData = getCurrentRankingData();

  return (
    <div className="space-y-8">
      {/* 주간 정보 */}
      <div className="text-center py-6 border border-border/20 rounded-lg bg-muted-foreground/5">
        <p className="text-lg font-light text-foreground">
          {formatDate(rankings.weekStart)} - {formatDate(rankings.weekEnd)}
        </p>
        <p className="text-sm text-muted-foreground/60 font-light mt-1">
          이번 주 랭킹 (매주 월요일 초기화)
        </p>
      </div>

      {/* 랭킹 타입 선택 */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => {
            setActiveRanking("hours");
            setCurrentPage(1);
          }}
          className={`px-4 sm:px-6 py-3 min-h-[44px] rounded-lg font-light transition-all active:scale-95 ${
            activeRanking === "hours"
              ? "bg-foreground text-background"
              : "bg-muted-foreground/10 text-muted-foreground hover:bg-muted-foreground/20"
          }`}
        >
          이용시간
        </button>
        <button
          onClick={() => {
            setActiveRanking("sessions");
            setCurrentPage(1);
          }}
          className={`px-4 sm:px-6 py-3 min-h-[44px] rounded-lg font-light transition-all active:scale-95 ${
            activeRanking === "sessions"
              ? "bg-foreground text-background"
              : "bg-muted-foreground/10 text-muted-foreground hover:bg-muted-foreground/20"
          }`}
        >
          방문횟수
        </button>
        <button
          onClick={() => {
            setActiveRanking("days");
            setCurrentPage(1);
          }}
          className={`px-4 sm:px-6 py-3 min-h-[44px] rounded-lg font-light transition-all active:scale-95 ${
            activeRanking === "days"
              ? "bg-foreground text-background"
              : "bg-muted-foreground/10 text-muted-foreground hover:bg-muted-foreground/20"
          }`}
        >
          이용일수
        </button>
      </div>

      {/* 랭킹 리스트 */}
      <div className="space-y-4">
        {currentData.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground/60 font-light">
              이번 주 랭킹에 참여한 사용자가 없습니다.
            </p>
          </div>
        ) : (
          currentData.map((user) => (
            <div
              key={`${user.rank}-${user.publicNickname}`}
              className="flex items-center justify-between p-6 border border-border/20 rounded-lg hover:bg-muted-foreground/5 transition-colors"
            >
              <div className="flex items-center space-x-6">
                <div className="text-center min-w-[60px]">
                  <div
                    className={`text-2xl font-mono font-extralight ${
                      user.rank === 1
                        ? "text-yellow-500"
                        : user.rank === 2
                          ? "text-gray-400"
                          : user.rank === 3
                            ? "text-amber-600"
                            : "text-foreground"
                    }`}
                  >
                    #{user.rank}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-lg font-light text-foreground">
                    {user.publicNickname}
                  </div>
                  <div className="text-sm text-muted-foreground/60 font-light">
                    {getTierDisplay(user.tier)}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-mono font-extralight text-foreground">
                  {formatValue(activeRanking, getCurrentValue(user))}
                </div>
                <div className="text-sm text-muted-foreground/60 font-light">
                  이번 주
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
