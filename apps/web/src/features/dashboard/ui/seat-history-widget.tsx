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
  recentActivity: Array<{
    date: string;
    roomName: string;
    seatNo: string;
    startTime: string;
    endTime: string;
    duration: string;
  }>;
  stats: {
    message: string;
    totalTimeMessage: string;
    visitCountMessage: string;
    favoriteRoomMessage: string;
  };
}

export const SeatHistoryWidget: React.FC = () => {
  const [data, setData] = useState<SeatHistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeatHistory = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get<SeatHistoryData>("/api/v1/stats/seat-history");
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
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-border/10">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-border/10">
        <div className="text-center text-gray-500">
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
            {data.stats.message}
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-2xl md:text-3xl font-light text-foreground">
            {data.stats.totalTimeMessage}
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

      {/* 인사이트 메시지 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        <div className="space-y-6">
          <p className="text-xl font-light text-foreground leading-relaxed">
            {data.stats.visitCountMessage}
          </p>
          <p className="text-xl font-light text-foreground leading-relaxed">
            {data.stats.favoriteRoomMessage}
          </p>
        </div>

        {/* 최근 활동 */}
        {data.recentActivity.length > 0 && (
          <div className="space-y-8">
            <h3 className="text-2xl font-light text-foreground">
              최근 이용 내역
            </h3>
            <div className="space-y-6">
              {data.recentActivity.slice(0, 3).map((activity, index) => (
                <div key={index} className="border-b border-border/20 pb-6 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h4 className="text-lg font-light text-foreground">
                        {activity.roomName}
                      </h4>
                      <p className="text-sm text-muted-foreground/60 font-light">
                        {activity.date} • 좌석 {activity.seatNo}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-mono text-lg font-light text-foreground">
                        {activity.duration}
                      </div>
                      <div className="text-xs text-muted-foreground/50 font-light">
                        {activity.startTime} — {activity.endTime}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};