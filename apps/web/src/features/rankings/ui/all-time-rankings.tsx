"use client";
import React, { useState } from "react";
import { useAllTimeRankings, RankingUser, RankingType } from "@/entities/rankings";
import { SkeletonList, ErrorState } from "@/shared/ui";

interface AllTimeRankingsProps {
  myNickname?: string | null;
}

export const AllTimeRankings: React.FC<AllTimeRankingsProps> = ({ myNickname }) => {
  const [activeRanking, setActiveRanking] = useState<RankingType>("hours");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: rankings, isLoading, isFetching } = useAllTimeRankings(currentPage);

  const getTierDisplay = (tier: string) => {
    const tierIcons: Record<string, React.ReactElement> = {
      Explorer: (
        <svg className="w-4 h-4 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
      ),
      Student: (
        <svg className="w-4 h-4 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
        </svg>
      ),
      Scholar: (
        <svg className="w-4 h-4 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
        </svg>
      ),
      Master: (
        <svg className="w-4 h-4 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
      Legend: (
        <svg className="w-4 h-4 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2.7-2h8.6l.9-5.4-2.1 1.4L12 8l-3.1 2L6.8 8.6L7.7 14z" />
        </svg>
      ),
      Myth: (
        <svg className="w-4 h-4 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor">
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

  const formatValue = (type: RankingType, value: number) => {
    const numValue = Number(value) || 0;
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

  const getCurrentValue = (user: RankingUser) => {
    switch (activeRanking) {
      case "hours":
        return user.totalHours;
      case "sessions":
        return user.totalSessions;
      case "days":
        return user.totalDays;
      default:
        return 0;
    }
  };

  if (isLoading && !rankings) {
    return (
      <div className="space-y-8">
        <SkeletonList count={10} />
      </div>
    );
  }

  if (!rankings) {
    return (
      <ErrorState
        message="랭킹 정보를 불러올 수 없습니다"
        variant="card"
      />
    );
  }

  const currentData = getCurrentRankingData();

  const getCurrentTotalPages = () => {
    if (!rankings?.pagination) return 1;
    return rankings.pagination.totalPages[activeRanking];
  };

  const getCurrentTotalItems = () => {
    if (!rankings?.pagination) return 0;
    return rankings.pagination.totalItems[activeRanking];
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = () => {
    const totalPages = getCurrentTotalPages();
    const totalItems = getCurrentTotalItems();

    if (totalPages <= 1) return null;

    const pages = [];
    const showPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    const endPage = Math.min(totalPages, startPage + showPages - 1);

    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex flex-col items-center space-y-4 mt-8">
        <div className="text-sm text-muted-foreground/60 font-light">
          총 {totalItems}개 중 {(currentPage - 1) * 20 + 1}-
          {Math.min(currentPage * 20, totalItems)}개 표시
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isFetching}
            className="px-3 sm:px-4 py-2 text-sm font-light border border-border/40 rounded-lg hover:bg-muted-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            이전
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 sm:px-4 py-2 text-sm font-light border border-border/40 rounded-lg hover:bg-muted-foreground/5 transition-colors min-h-[44px]"
              >
                1
              </button>
              {startPage > 2 && (
                <span className="px-2 text-muted-foreground/60">...</span>
              )}
            </>
          )}

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              disabled={isFetching}
              className={`px-3 sm:px-4 py-2 text-sm font-light border rounded-lg transition-colors min-h-[44px] ${
                page === currentPage
                  ? "bg-foreground text-background border-foreground"
                  : "border-border/40 hover:bg-muted-foreground/5"
              }`}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="px-2 text-muted-foreground/60">...</span>
              )}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-3 sm:px-4 py-2 text-sm font-light border border-border/40 rounded-lg hover:bg-muted-foreground/5 transition-colors min-h-[44px]"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isFetching}
            className="px-3 sm:px-4 py-2 text-sm font-light border border-border/40 rounded-lg hover:bg-muted-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            다음
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* 랭킹 타입 선택 */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 overflow-x-auto">
        <button
          onClick={() => {
            setActiveRanking("hours");
            setCurrentPage(1);
          }}
          className={`px-4 sm:px-6 py-3 rounded-lg font-light transition-colors min-h-[44px] break-keep ${
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
          className={`px-4 sm:px-6 py-3 rounded-lg font-light transition-colors min-h-[44px] break-keep ${
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
          className={`px-4 sm:px-6 py-3 rounded-lg font-light transition-colors min-h-[44px] break-keep ${
            activeRanking === "days"
              ? "bg-foreground text-background"
              : "bg-muted-foreground/10 text-muted-foreground hover:bg-muted-foreground/20"
          }`}
        >
          이용일수
        </button>
      </div>

      {/* 랭킹 리스트 */}
      <div className={`space-y-4 ${isFetching ? 'opacity-50' : ''}`}>
        {currentData.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground/60 font-light">
              아직 랭킹에 참여한 사용자가 없습니다.
            </p>
          </div>
        ) : (
          currentData.map((user) => {
            const isMe = myNickname && user.publicNickname === myNickname;
            return (
              <div
                key={`${user.rank}-${user.publicNickname}`}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border rounded-lg transition-colors space-y-3 sm:space-y-0 ${
                  isMe 
                    ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20" 
                    : "border-border/20 hover:bg-muted-foreground/5"
                }`}
              >
                <div className="flex items-center space-x-4 sm:space-x-6">
                  <div className="text-center min-w-[50px] sm:min-w-[60px]">
                    <div
                      className={`text-xl sm:text-2xl font-mono font-extralight ${
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

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg font-light text-foreground truncate">
                        {user.publicNickname}
                      </span>
                      {isMe && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded-full shrink-0">
                          나
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground/60 font-light">
                      {getTierDisplay(user.tier)}
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-lg sm:text-xl font-mono font-extralight text-foreground">
                    {formatValue(activeRanking, getCurrentValue(user))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 페이지네이션 */}
      {renderPagination()}
    </div>
  );
};
