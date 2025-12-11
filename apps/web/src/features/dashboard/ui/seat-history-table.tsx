"use client";
import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

interface SeatActivity {
  id: string;
  date: string;
  roomName: string;
  seatNo: string;
  startTime: string;
  endTime: string;
  duration: string;
  usageHours: number;
}

interface SeatHistoryTableData {
  activities: SeatActivity[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface SeatHistoryTableProps {
  className?: string;
}

export const SeatHistoryTable: React.FC<SeatHistoryTableProps> = ({
  className = "",
}) => {
  const [data, setData] = useState<SeatHistoryTableData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchSeatHistory = async (
    page: number = 1,
    start?: string,
    end?: string
  ) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(start && { startDate: start }),
        ...(end && { endDate: end }),
      });

      const response = await apiClient.get<SeatHistoryTableData>(
        `/api/v1/stats/seat-history/full?${params.toString()}`
      );
      setData(response);
      setError(null);
    } catch (err) {
      console.error("이용 내역 조회 실패:", err);
      setError("이용 내역을 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSeatHistory(currentPage, startDate, endDate);
  }, [currentPage, startDate, endDate]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDateFilter = () => {
    setCurrentPage(1);
    fetchSeatHistory(1, startDate, endDate);
  };

  const handleResetFilter = () => {
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    fetchSeatHistory(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:MM 형태로 변환
  };

  if (isLoading && !data) {
    return (
      <section className={`py-16 md:py-20 ${className}`}>
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="h-10 bg-muted-foreground/10 rounded animate-pulse" />
            <div className="h-4 bg-muted-foreground/10 rounded animate-pulse w-32" />
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 bg-muted-foreground/10 rounded animate-pulse flex-1"
                />
              ))}
            </div>

            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-muted-foreground/10 rounded animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className={`py-16 md:py-20 ${className}`}>
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-extralight text-foreground">
              이용 내역
            </h2>
            <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
              Usage History
            </p>
          </div>

          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground/60 font-light">
              {error || "이용 내역을 불러올 수 없습니다."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 md:py-20 ${className}`}>
      <div className="space-y-8">
        {/* 섹션 헤더 */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-extralight text-foreground">
            이용 내역
          </h2>
          <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
            Usage History
          </p>
        </div>

        {/* 기간 필터 */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="space-y-2">
              <label className="text-sm mx-2 font-light text-muted-foreground/80">
                시작일
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border border-border/20 rounded-lg bg-background text-foreground font-light focus:outline-none focus:ring-2 focus:ring-foreground/20 min-w-[140px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm mx-2 font-light text-muted-foreground/80">
                종료일
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 border border-border/20 rounded-lg bg-background text-foreground font-light focus:outline-none focus:ring-2 focus:ring-foreground/20 min-w-[140px]"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDateFilter}
              disabled={isLoading}
              className="px-4 py-2 min-h-[40px] bg-foreground text-background rounded-lg font-light hover:bg-foreground/90 transition-colors disabled:opacity-50 active:scale-95"
            >
              필터 적용
            </button>
            <button
              onClick={handleResetFilter}
              disabled={isLoading}
              className="px-4 py-2 min-h-[40px] border border-border/20 text-foreground rounded-lg font-light hover:bg-muted-foreground/10 transition-colors disabled:opacity-50 active:scale-95"
            >
              초기화
            </button>
          </div>
        </div>

        {/* 결과 요약 */}
        {data.totalCount > 0 && (
          <div className="text-sm text-muted-foreground/60 font-light">
            총 {data.totalCount.toLocaleString()}개의 이용 내역
            {(startDate || endDate) && " (필터 적용됨)"}
          </div>
        )}

        {/* 테이블 */}
        <div className="border border-border/20 rounded-lg overflow-hidden">
          {data.activities.length > 0 ? (
            <>
              {/* 데스크톱 테이블 헤더 */}
              <div className="hidden md:block bg-muted-foreground/5 border-b border-border/10">
                <div className="grid grid-cols-6 gap-4 p-4 text-sm font-light text-muted-foreground/80">
                  <div>날짜</div>
                  <div className="col-span-2">열람실</div>
                  <div>좌석</div>
                  <div>이용 시간</div>
                  <div>총 시간</div>
                </div>
              </div>

              {/* 테이블 바디 */}
              <div className="divide-y divide-border/10">
                {data.activities.map((activity) => (
                  <div key={activity.id}>
                    {/* 모바일 카드 형태 */}
                    <div className="block md:hidden p-4 space-y-3 hover:bg-muted-foreground/5 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="font-light text-foreground text-lg">
                          {activity.roomName}
                        </div>
                        <div className="font-mono font-light text-foreground">
                          {activity.duration}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="font-light text-muted-foreground/70">
                          {formatDate(activity.date)} • 좌석 {activity.seatNo}
                        </div>
                        <div className="font-mono text-sm font-light text-muted-foreground/70">
                          {formatTime(activity.startTime)} -{" "}
                          {formatTime(activity.endTime)}
                        </div>
                      </div>
                    </div>

                    {/* 데스크톱 테이블 형태 */}
                    <div className="hidden md:grid grid-cols-6 gap-4 p-4 hover:bg-muted-foreground/5 transition-colors">
                      <div className="font-light text-foreground">
                        {formatDate(activity.date)}
                      </div>
                      <div className="col-span-2 font-light text-foreground">
                        {activity.roomName}
                      </div>
                      <div className="font-light text-muted-foreground/70">
                        {activity.seatNo}
                      </div>
                      <div className="font-mono text-sm font-light text-muted-foreground/70">
                        {formatTime(activity.startTime)} -{" "}
                        {formatTime(activity.endTime)}
                      </div>
                      <div className="font-mono font-light text-foreground">
                        {activity.duration}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <p className="text-muted-foreground/60 font-light">
                {startDate || endDate
                  ? "해당 기간에 이용 내역이 없습니다."
                  : "이용 내역이 없습니다."}
              </p>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {data.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            {/* 이전 페이지 */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!data.hasPrevPage || isLoading}
              className="px-3 py-2 min-h-[40px] border border-border/20 rounded-lg font-light disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted-foreground/10 transition-colors active:scale-95"
            >
              이전
            </button>

            {/* 페이지 번호 */}
            <div className="flex space-x-1">
              {(() => {
                const pages = [];
                const start = Math.max(1, currentPage - 2);
                const end = Math.min(data.totalPages, currentPage + 2);

                // 시작 페이지가 1이 아니면 1과 ... 추가
                if (start > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => handlePageChange(1)}
                      className="px-3 py-2 min-h-[40px] border border-border/20 rounded-lg font-light hover:bg-muted-foreground/10 transition-colors active:scale-95"
                    >
                      1
                    </button>
                  );
                  if (start > 2) {
                    pages.push(
                      <span
                        key="start-ellipsis"
                        className="px-2 py-2 font-light text-muted-foreground/60"
                      >
                        ...
                      </span>
                    );
                  }
                }

                // 현재 페이지 주변 페이지들
                for (let i = start; i <= end; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      disabled={isLoading}
                      className={`px-3 py-2 min-h-[40px] rounded-lg font-light transition-colors active:scale-95 ${
                        i === currentPage
                          ? "bg-foreground text-background"
                          : "border border-border/20 hover:bg-muted-foreground/10"
                      }`}
                    >
                      {i}
                    </button>
                  );
                }

                // 끝 페이지가 totalPages가 아니면 ... 과 totalPages 추가
                if (end < data.totalPages) {
                  if (end < data.totalPages - 1) {
                    pages.push(
                      <span
                        key="end-ellipsis"
                        className="px-2 py-2 font-light text-muted-foreground/60"
                      >
                        ...
                      </span>
                    );
                  }
                  pages.push(
                    <button
                      key={data.totalPages}
                      onClick={() => handlePageChange(data.totalPages)}
                      className="px-3 py-2 min-h-[40px] border border-border/20 rounded-lg font-light hover:bg-muted-foreground/10 transition-colors active:scale-95"
                    >
                      {data.totalPages}
                    </button>
                  );
                }

                return pages;
              })()}
            </div>

            {/* 다음 페이지 */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!data.hasNextPage || isLoading}
              className="px-3 py-2 min-h-[40px] border border-border/20 rounded-lg font-light disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted-foreground/10 transition-colors active:scale-95"
            >
              다음
            </button>
          </div>
        )}

        {/* 로딩 스켈레톤 */}
        {isLoading && data && (
          <div className="border border-border/20 rounded-lg overflow-hidden">
            {/* 데스크톱 스켈레톤 헤더 */}
            <div className="hidden md:block bg-muted-foreground/5 border-b border-border/10">
              <div className="grid grid-cols-6 gap-4 p-4">
                <div className="h-4 bg-muted-foreground/10 rounded animate-pulse" />
                <div className="col-span-2 h-4 bg-muted-foreground/10 rounded animate-pulse" />
                <div className="h-4 bg-muted-foreground/10 rounded animate-pulse" />
                <div className="h-4 bg-muted-foreground/10 rounded animate-pulse" />
                <div className="h-4 bg-muted-foreground/10 rounded animate-pulse" />
              </div>
            </div>

            {/* 스켈레톤 바디 */}
            <div className="divide-y divide-border/10">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i}>
                  {/* 모바일 스켈레톤 카드 */}
                  <div className="block md:hidden p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-5 bg-muted-foreground/10 rounded animate-pulse flex-1 mr-4" />
                      <div className="h-5 bg-muted-foreground/10 rounded animate-pulse w-16" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-muted-foreground/10 rounded animate-pulse w-32" />
                      <div className="h-4 bg-muted-foreground/10 rounded animate-pulse w-20" />
                    </div>
                  </div>

                  {/* 데스크톱 스켈레톤 테이블 */}
                  <div className="hidden md:grid grid-cols-6 gap-4 p-4">
                    <div className="h-4 bg-muted-foreground/10 rounded animate-pulse" />
                    <div className="col-span-2 h-4 bg-muted-foreground/10 rounded animate-pulse" />
                    <div className="h-4 bg-muted-foreground/10 rounded animate-pulse w-16" />
                    <div className="h-4 bg-muted-foreground/10 rounded animate-pulse" />
                    <div className="h-4 bg-muted-foreground/10 rounded animate-pulse w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
