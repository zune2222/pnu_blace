"use client";
import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

interface RankingUser {
  rank: number;
  publicNickname: string;
  totalHours: number;
  totalSessions: number;
  totalDays: number;
  tier: string;
}

interface PaginationInfo {
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
}

interface RankingsData {
  hoursRanking: RankingUser[];
  sessionsRanking: RankingUser[];
  daysRanking: RankingUser[];
  pagination: PaginationInfo;
}

type RankingType = "hours" | "sessions" | "days";

export const AllTimeRankings: React.FC = () => {
  const [rankings, setRankings] = useState<RankingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRanking, setActiveRanking] = useState<RankingType>("hours");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchRankings = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get<RankingsData>(
          `/api/v1/stats/rankings/all-time?page=${currentPage}&limit=20`
        );
        setRankings(response);
      } catch (error) {
        console.error("전체 랭킹 조회 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankings();
  }, [currentPage]);

  const getTierDisplay = (tier: string) => {
    const tierIcons: Record<string, React.ReactElement> = {
      Explorer: (
        <svg className="w-4 h-4 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
      ),
      Student: (
        <svg className="w-4 h-4 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
        </svg>
      ),
      Scholar: (
        <svg className="w-4 h-4 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
        </svg>
      ),
      Master: (
        <svg className="w-4 h-4 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 4V2c0-0.55-0.45-1-1-1S5 1.45 5 2v2C3.34 4.56 2.56 6.33 2.56 8.5S3.34 12.44 5 13v7c0 0.55 0.45 1 1 1s1-0.45 1-1v-7c1.66-0.56 2.44-2.33 2.44-4.5S8.66 4.56 7 4zm5-2v2c0 0.55 0.45 1 1 1s1-0.45 1-1V2c1.66 0.56 2.44 2.33 2.44 4.5S16.66 10.44 15 11v9c0 0.55 0.45 1 1 1s1-0.45 1-1v-9c1.66-0.56 2.44-2.33 2.44-4.5S18.66 2.56 17 2c0-0.55-0.45-1-1-1s-1 0.45-1 1z"/>
        </svg>
      ),
      Legend: (
        <svg className="w-4 h-4 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2.7-2h8.6l.9-5.4-2.1 1.4L12 8l-3.1 2L6.8 8.6L7.7 14z"/>
        </svg>
      ),
      Myth: (
        <svg className="w-4 h-4 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
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
          랭킹 정보를 불러올 수 없습니다.
        </p>
      </div>
    );
  }

  const currentData = getCurrentRankingData();
  
  const getCurrentTotalPages = () => {
    if (!rankings?.pagination) return 1;
    switch (activeRanking) {
      case "hours":
        return rankings.pagination.totalPages.hours;
      case "sessions":
        return rankings.pagination.totalPages.sessions;
      case "days":
        return rankings.pagination.totalPages.days;
      default:
        return 1;
    }
  };

  const getCurrentTotalItems = () => {
    if (!rankings?.pagination) return 0;
    switch (activeRanking) {
      case "hours":
        return rankings.pagination.totalItems.hours;
      case "sessions":
        return rankings.pagination.totalItems.sessions;
      case "days":
        return rankings.pagination.totalItems.days;
      default:
        return 0;
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    const totalPages = getCurrentTotalPages();
    const totalItems = getCurrentTotalItems();
    
    if (totalPages <= 1) return null;

    const pages = [];
    const showPages = 5; // 표시할 페이지 수
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);
    
    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex flex-col items-center space-y-4 mt-8">
        <div className="text-sm text-muted-foreground/60 font-light">
          총 {totalItems}개 중 {(currentPage - 1) * 20 + 1}-{Math.min(currentPage * 20, totalItems)}개 표시
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-light border border-border/40 rounded-lg hover:bg-muted-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            이전
          </button>
          
          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-2 text-sm font-light border border-border/40 rounded-lg hover:bg-muted-foreground/5 transition-colors"
              >
                1
              </button>
              {startPage > 2 && <span className="px-2 text-muted-foreground/60">...</span>}
            </>
          )}
          
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 text-sm font-light border rounded-lg transition-colors ${
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
              {endPage < totalPages - 1 && <span className="px-2 text-muted-foreground/60">...</span>}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-3 py-2 text-sm font-light border border-border/40 rounded-lg hover:bg-muted-foreground/5 transition-colors"
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-light border border-border/40 rounded-lg hover:bg-muted-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
      <div className="flex space-x-4">
        <button
          onClick={() => {
            setActiveRanking("hours");
            setCurrentPage(1);
          }}
          className={`px-6 py-2 rounded-lg font-light transition-colors ${
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
          className={`px-6 py-2 rounded-lg font-light transition-colors ${
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
          className={`px-6 py-2 rounded-lg font-light transition-colors ${
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
              아직 랭킹에 참여한 사용자가 없습니다.
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
                  <div className={`text-2xl font-mono font-extralight ${
                    user.rank === 1 ? "text-yellow-500" :
                    user.rank === 2 ? "text-gray-400" :
                    user.rank === 3 ? "text-amber-600" :
                    "text-foreground"
                  }`}>
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
              </div>
            </div>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {renderPagination()}
    </div>
  );
};