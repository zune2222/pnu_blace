"use client";
import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

type RankingPeriod = "weekly" | "all-time";

interface MyStatsData {
  weeklyStats: {
    weeklyUsageHours: number;
    weeklySessions: number;
    weeklyDays: number;
    weekStartDate: string;
  };
  allTimeStats: {
    totalUsageHours: number;
    totalSessions: number;
    totalDays: number;
    tier: string;
  };
}

interface AllTimeRankingData {
  totalUsers: number;
  hoursRank?: number;
  sessionsRank?: number;
  daysRank?: number;
  hoursPercentile?: number;
  sessionsPercentile?: number;
  daysPercentile?: number;
  tier: string;
}

export const MyDashboardRankings: React.FC = () => {
  const [activePeriod, setActivePeriod] = useState<RankingPeriod>("weekly");
  const [myStats, setMyStats] = useState<MyStatsData | null>(null);
  const [allTimeData, setAllTimeData] = useState<AllTimeRankingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setIsLoading(true);
        
        // 내 통계와 전체 랭킹을 병렬로 가져오기
        const [myStatsResponse, allTimeResponse] = await Promise.all([
          apiClient.get<MyStatsData>("/api/v1/stats/me"),
          apiClient.get<AllTimeRankingData>("/api/v1/stats/my-rank")
        ]);

        setMyStats(myStatsResponse);
        setAllTimeData(allTimeResponse);
      } catch (error) {
        console.error("랭킹 데이터 조회 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankings();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const getTierDisplay = (tier: string) => {
    const tierIcons: Record<string, string> = {
      Explorer: "🔍",
      Student: "📚", 
      Scholar: "🎓",
      Master: "👑",
      Legend: "⭐",
      Myth: "⚡",
    };

    return (
      <span className="flex items-center justify-center gap-1 text-sm font-light text-foreground">
        <span>{tierIcons[tier] || "📚"}</span>
        <span>{tier}</span>
      </span>
    );
  };

  if (isLoading) {
    return (
      <section className="py-16 md:py-20">
        <div className="space-y-8">
          <h2 className="text-3xl md:text-4xl font-extralight text-foreground">
            내 랭킹
          </h2>
          <div className="animate-pulse">
            <div className="h-40 bg-muted-foreground/10 rounded"></div>
          </div>
        </div>
      </section>
    );
  }

  const hasData = activePeriod === "weekly" ? myStats?.weeklyStats : allTimeData;

  if (!hasData) {
    return (
      <section className="py-16 md:py-20">
        <div className="space-y-8">
          <h2 className="text-3xl md:text-4xl font-extralight text-foreground">
            내 랭킹
          </h2>
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground/60 font-light break-keep">
              아직 랭킹 데이터가 없습니다.
            </p>
            <p className="text-sm text-muted-foreground/50 font-light break-keep">
              도서관을 이용하면 랭킹이 집계됩니다.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20">
      <div className="space-y-8">
        {/* 섹션 헤더 */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-extralight text-foreground">
            내 랭킹
          </h2>
          <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
            My Rankings
          </p>
        </div>

        {/* 기간 선택 탭 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setActivePeriod("weekly")}
            className={`px-4 sm:px-6 py-3 min-h-[44px] rounded-lg font-light transition-all active:scale-95 ${
              activePeriod === "weekly"
                ? "bg-foreground text-background"
                : "bg-muted-foreground/10 text-muted-foreground hover:bg-muted-foreground/20"
            }`}
          >
            이번주
          </button>
          <button
            onClick={() => setActivePeriod("all-time")}
            className={`px-4 sm:px-6 py-3 min-h-[44px] rounded-lg font-light transition-all active:scale-95 ${
              activePeriod === "all-time"
                ? "bg-foreground text-background"
                : "bg-muted-foreground/10 text-muted-foreground hover:bg-muted-foreground/20"
            }`}
          >
            전체
          </button>
        </div>

        {/* 주간 정보 표시 */}
        {activePeriod === "weekly" && myStats?.weeklyStats && (
          <div className="text-center py-4 border border-border/20 rounded-lg bg-muted-foreground/5">
            <p className="text-sm font-light text-foreground">
              {formatDate(myStats.weeklyStats.weekStartDate)} - {formatDate(new Date().toISOString())}
            </p>
            <p className="text-xs text-muted-foreground/60 font-light mt-1">
              이번 주 이용 현황
            </p>
          </div>
        )}

        {/* 랭킹 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {activePeriod === "weekly" ? (
            // 이번주 통계
            <>
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
                    Hours
                  </p>
                  <div className="font-mono text-3xl font-extralight text-foreground">
                    {myStats?.weeklyStats.weeklyUsageHours || 0}h
                  </div>
                  <p className="text-sm text-muted-foreground/60 font-light">
                    이용시간
                  </p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
                    Visits
                  </p>
                  <div className="font-mono text-3xl font-extralight text-foreground">
                    {myStats?.weeklyStats.weeklySessions || 0}
                  </div>
                  <p className="text-sm text-muted-foreground/60 font-light">
                    방문횟수
                  </p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
                    Days
                  </p>
                  <div className="font-mono text-3xl font-extralight text-foreground">
                    {myStats?.weeklyStats.weeklyDays || 0}
                  </div>
                  <p className="text-sm text-muted-foreground/60 font-light">
                    이용일수
                  </p>
                </div>
              </div>
            </>
          ) : (
            // 전체 랭킹
            <>
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
                    Hours Rank
                  </p>
                  <div className="font-mono text-3xl font-extralight text-foreground">
                    #{allTimeData?.hoursRank || "—"}
                  </div>
                  {allTimeData?.hoursPercentile != null && (
                    <p className="text-sm text-muted-foreground/60 font-light">
                      상위 {Math.max(0, 100 - allTimeData.hoursPercentile)}%
                    </p>
                  )}
                </div>
              </div>

              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
                    Visits Rank
                  </p>
                  <div className="font-mono text-3xl font-extralight text-foreground">
                    #{allTimeData?.sessionsRank || "—"}
                  </div>
                  {allTimeData?.sessionsPercentile != null && (
                    <p className="text-sm text-muted-foreground/60 font-light">
                      상위 {Math.max(0, 100 - allTimeData.sessionsPercentile)}%
                    </p>
                  )}
                </div>
              </div>

              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
                    Days Rank
                  </p>
                  <div className="font-mono text-3xl font-extralight text-foreground">
                    #{allTimeData?.daysRank || "—"}
                  </div>
                  {allTimeData?.daysPercentile != null && (
                    <p className="text-sm text-muted-foreground/60 font-light">
                      상위 {Math.max(0, 100 - allTimeData.daysPercentile)}%
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 티어 정보 */}
        <div className="text-center pt-6 border-t border-border/20 space-y-2">
          <div className="text-lg font-light">
            {getTierDisplay(activePeriod === "weekly" ? myStats?.allTimeStats.tier || "Student" : allTimeData?.tier || "Student")}
          </div>
          {activePeriod === "all-time" && allTimeData?.totalUsers && (
            <p className="text-sm text-muted-foreground/60 font-light">
              전체 {allTimeData.totalUsers}명 중
            </p>
          )}
        </div>
      </div>
    </section>
  );
};