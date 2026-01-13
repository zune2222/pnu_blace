"use client";
import React, { useState, useEffect } from "react";
import { 
  useMyRank, 
  usePersonalStats, 
  MyRankData, 
  MyStatsData 
} from "@/entities/dashboard";
import { SkeletonStats, EmptyState } from "@/shared/ui";
import { ShareStoryButton } from "@/features/share";

type RankingPeriod = "weekly" | "all-time";

export const MyDashboardRankings: React.FC = () => {
  const [activePeriod, setActivePeriod] = useState<RankingPeriod>("weekly");
  
  const { data: myStats, isLoading: isStatsLoading } = usePersonalStats();
  const { data: myRankData, isLoading: isRankLoading } = useMyRank();
  
  const isLoading = isStatsLoading || isRankLoading;

  // 데이터 존재 여부를 더 정확하게 체크
  const hasWeeklyData = myRankData && 
    (myRankData.weeklyUsageHours > 0 || 
     myRankData.weeklySessions > 0 || 
     myRankData.weeklyDays > 0);

  const hasAllTimeData = myRankData && 
    (myRankData.hoursRank || myRankData.sessionsRank || myRankData.daysRank);

  // 이번주 데이터가 없고 전체 데이터가 있으면 전체 탭으로 자동 전환
  useEffect(() => {
    if (!isLoading && !hasWeeklyData && hasAllTimeData && activePeriod === "weekly") {
      setActivePeriod("all-time");
    }
  }, [hasWeeklyData, hasAllTimeData, activePeriod, isLoading]);

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
          <SkeletonStats />
        </div>
      </section>
    );
  }

  // 진짜로 아무 데이터도 없을 때만 "데이터 없음" 표시
  if (!hasWeeklyData && !hasAllTimeData) {
    return (
      <section className="py-16 md:py-20">
        <div className="space-y-8">
          <h2 className="text-3xl md:text-4xl font-extralight text-foreground">
            내 랭킹
          </h2>
          <EmptyState
            title="아직 랭킹 데이터가 없습니다"
            message="도서관을 이용하면 랭킹이 집계됩니다."
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20">
      <div className="space-y-8">
        {/* 섹션 헤더 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl md:text-4xl font-extralight text-foreground">
              내 랭킹
            </h2>
            <ShareStoryButton cardVariant="dashboard" buttonVariant="icon" />
          </div>
          <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
            My Rankings
          </p>
        </div>

        {/* 기간 선택 탭 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setActivePeriod("weekly")}
            disabled={!hasWeeklyData}
            className={`px-4 sm:px-6 py-3 min-h-[44px] rounded-lg font-light transition-all active:scale-95 ${
              activePeriod === "weekly"
                ? "bg-foreground text-background"
                : hasWeeklyData 
                  ? "bg-muted-foreground/10 text-muted-foreground hover:bg-muted-foreground/20"
                  : "bg-muted-foreground/5 text-muted-foreground/40 cursor-not-allowed"
            }`}
          >
            이번주
            {!hasWeeklyData && (
              <span className="text-xs ml-2 opacity-60">(데이터 없음)</span>
            )}
          </button>
          <button
            onClick={() => setActivePeriod("all-time")}
            disabled={!hasAllTimeData}
            className={`px-4 sm:px-6 py-3 min-h-[44px] rounded-lg font-light transition-all active:scale-95 ${
              activePeriod === "all-time"
                ? "bg-foreground text-background"
                : hasAllTimeData
                  ? "bg-muted-foreground/10 text-muted-foreground hover:bg-muted-foreground/20"
                  : "bg-muted-foreground/5 text-muted-foreground/40 cursor-not-allowed"
            }`}
          >
            전체
          </button>
        </div>

        {/* 상태 안내 메시지 */}
        {activePeriod === "weekly" && hasWeeklyData && myRankData?.weekStartDate && (
          <div className="text-center py-4 border border-border/20 rounded-lg bg-muted-foreground/5">
            <p className="text-sm font-light text-foreground">
              {formatDate(myRankData.weekStartDate)} - {formatDate(new Date().toISOString())}
            </p>
            <p className="text-xs text-muted-foreground/60 font-light mt-1">
              이번 주 이용 현황
            </p>
          </div>
        )}

        {activePeriod === "all-time" && hasAllTimeData && !hasWeeklyData && (
          <div className="text-center py-4 border border-amber-200/20 rounded-lg bg-amber-500/5">
            <p className="text-sm font-light text-foreground">
              이번 주 데이터는 아직 없어서 전체 랭킹을 보여드려요
            </p>
            <p className="text-xs text-muted-foreground/60 font-light mt-1">
              도서관을 이용하면 이번 주 데이터가 집계됩니다
            </p>
          </div>
        )}

        {/* 랭킹 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {activePeriod === "weekly" && hasWeeklyData ? (
            // 이번주 통계
            <>
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
                    Hours
                  </p>
                  <div className="font-mono text-3xl font-extralight text-foreground">
                    {myRankData?.weeklyUsageHours || 0}h
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
                    {myRankData?.weeklySessions || 0}
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
                    {myRankData?.weeklyDays || 0}
                  </div>
                  <p className="text-sm text-muted-foreground/60 font-light">
                    이용일수
                  </p>
                </div>
              </div>
            </>
          ) : activePeriod === "all-time" && hasAllTimeData ? (
            // 전체 랭킹
            <>
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
                    Hours Rank
                  </p>
                  <div className="font-mono text-3xl font-extralight text-foreground">
                    #{myRankData?.hoursRank || "—"}
                  </div>
                  {myRankData?.hoursPercentile != null && (
                    <p className="text-sm text-muted-foreground/60 font-light">
                      상위 {Math.max(0, 100 - myRankData.hoursPercentile)}%
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
                    #{myRankData?.sessionsRank || "—"}
                  </div>
                  {myRankData?.sessionsPercentile != null && (
                    <p className="text-sm text-muted-foreground/60 font-light">
                      상위 {Math.max(0, 100 - myRankData.sessionsPercentile)}%
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
                    #{myRankData?.daysRank || "—"}
                  </div>
                  {myRankData?.daysPercentile != null && (
                    <p className="text-sm text-muted-foreground/60 font-light">
                      상위 {Math.max(0, 100 - myRankData.daysPercentile)}%
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            // 선택된 탭에 데이터가 없을 때
            <div className="col-span-3 text-center py-8">
              <p className="text-muted-foreground/60 font-light break-keep">
                {activePeriod === "weekly" ? "이번 주 데이터가 아직 없습니다." : "전체 랭킹 데이터가 없습니다."}
              </p>
            </div>
          )}
        </div>

        {/* 티어 정보 */}
        <div className="text-center pt-6 border-t border-border/20 space-y-2">
          <div className="text-lg font-light">
            {getTierDisplay(activePeriod === "weekly" ? myStats?.tier || "Student" : myRankData?.tier || "Student")}
          </div>
          {activePeriod === "all-time" && myRankData?.totalUsers && (
            <p className="text-sm text-muted-foreground/60 font-light">
              전체 {myRankData.totalUsers}명 중
            </p>
          )}
        </div>
      </div>
    </section>
  );
};