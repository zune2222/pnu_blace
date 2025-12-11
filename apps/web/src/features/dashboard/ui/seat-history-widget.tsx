"use client";
import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

interface SeatHistoryData {
  totalSessions: number;
  totalUsageHours: number;
  totalDays: number;
  averageSessionHours: number;
  favoriteRoom: {
    name: string;
    count: number;
    totalHours: number;
  } | null;
}

export const SeatHistoryWidget: React.FC = () => {
  const [data, setData] = useState<SeatHistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeatHistory = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get<SeatHistoryData>(
          "/api/v1/stats/seat-history"
        );
        setData(response);
        setError(null);
      } catch (err) {
        console.error("자리 내역 조회 실패:", err);
        setError("자리 내역을 불러올 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeatHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-muted-foreground/10 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-muted-foreground/10 rounded"
              ></div>
            ))}
          </div>
          <div className="h-32 bg-muted-foreground/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-8">
        <div className="text-center text-muted-foreground/70">
          <p>{error || "데이터를 불러올 수 없습니다."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 md:space-y-24">
      {/* 헤더 섹션 */}
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-extralight text-foreground leading-tight mb-4">
            내 도서관 이용 통계
          </h1>
          <p className="text-lg text-muted-foreground/70 font-light">
            지금까지의 도서관 이용 현황을 한눈에 확인하세요.
          </p>
        </div>
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
        <div className="text-center space-y-3">
          <div className="font-mono text-4xl md:text-5xl font-extralight text-foreground">
            {data.totalUsageHours}h
          </div>
          <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
            Total Hours
          </p>
        </div>
        <div className="text-center space-y-3">
          <div className="font-mono text-4xl md:text-5xl font-extralight text-foreground">
            {data.totalSessions}
          </div>
          <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
            Visits
          </p>
        </div>
        <div className="text-center space-y-3">
          <div className="font-mono text-4xl md:text-5xl font-extralight text-foreground">
            {data.totalDays}
          </div>
          <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
            Days
          </p>
        </div>
        <div className="text-center space-y-3">
          <div className="font-mono text-4xl md:text-5xl font-extralight text-foreground">
            {data.averageSessionHours.toFixed(1)}h
          </div>
          <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
            Average
          </p>
        </div>
      </div>
    </div>
  );
};
