"use client";
import React, { useState, useEffect } from "react";
import { useSeatHistoryTable, SeatHistoryTableData } from "@/entities/dashboard";
import { SkeletonTable, ErrorState } from "@/shared/ui";

interface SeatHistoryTableProps {
  className?: string;
}

export const SeatHistoryTable: React.FC<SeatHistoryTableProps> = ({
  className = "",
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterStartDate, setFilterStartDate] = useState<string | undefined>();
  const [filterEndDate, setFilterEndDate] = useState<string | undefined>();

  const { data, isLoading, isFetching } = useSeatHistoryTable(currentPage, filterStartDate, filterEndDate);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDateFilter = () => {
    setCurrentPage(1);
    setFilterStartDate(startDate || undefined);
    setFilterEndDate(endDate || undefined);
  };

  const handleResetFilter = () => {
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    setFilterStartDate(undefined);
    setFilterEndDate(undefined);
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
    return timeString.substring(0, 5);
  };

  if (isLoading && !data) {
    return (
      <section className={`py-16 md:py-20 ${className}`}>
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-extralight text-foreground">이용 내역</h2>
            <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">Usage History</p>
          </div>
          <SkeletonTable rows={5} cols={4} />
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className={`py-16 md:py-20 ${className}`}>
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-extralight text-foreground">이용 내역</h2>
            <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">Usage History</p>
          </div>
          <ErrorState
            message="이용 내역을 불러올 수 없습니다"
            variant="card"
          />
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 md:py-20 ${className}`}>
      <div className="space-y-8">
        {/* 섹션 헤더 */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-extralight text-foreground">이용 내역</h2>
          <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">Usage History</p>
        </div>

        {/* 기간 필터 */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="space-y-2">
              <label className="text-sm mx-2 font-light text-muted-foreground/80">시작일</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border border-border/20 rounded-lg bg-background text-foreground font-light focus:outline-none focus:ring-2 focus:ring-foreground/20 min-w-[140px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm mx-2 font-light text-muted-foreground/80">종료일</label>
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
              disabled={isFetching}
              className="px-4 py-2 min-h-[40px] bg-foreground text-background rounded-lg font-light hover:bg-foreground/90 transition-colors disabled:opacity-50 active:scale-95"
            >
              필터 적용
            </button>
            <button
              onClick={handleResetFilter}
              disabled={isFetching}
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
            {(filterStartDate || filterEndDate) && " (필터 적용됨)"}
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
              <div className={`divide-y divide-border/10 ${isFetching ? 'opacity-50' : ''}`}>
                {data.activities.map((activity) => (
                  <div key={activity.id}>
                    {/* 모바일 카드 형태 */}
                    <div className="block md:hidden p-4 space-y-3 hover:bg-muted-foreground/5 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="font-light text-foreground text-lg">{activity.roomName}</div>
                        <div className="font-mono font-light text-foreground">{activity.duration}</div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="font-light text-muted-foreground/70">
                          {formatDate(activity.date)} • 좌석 {activity.seatNo}
                        </div>
                        <div className="font-mono text-sm font-light text-muted-foreground/70">
                          {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
                        </div>
                      </div>
                    </div>

                    {/* 데스크톱 테이블 형태 */}
                    <div className="hidden md:grid grid-cols-6 gap-4 p-4 hover:bg-muted-foreground/5 transition-colors">
                      <div className="font-light text-foreground">{formatDate(activity.date)}</div>
                      <div className="col-span-2 font-light text-foreground">{activity.roomName}</div>
                      <div className="font-light text-muted-foreground/70">{activity.seatNo}</div>
                      <div className="font-mono text-sm font-light text-muted-foreground/70">
                        {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
                      </div>
                      <div className="font-mono font-light text-foreground">{activity.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <p className="text-muted-foreground/60 font-light">
                {filterStartDate || filterEndDate ? "해당 기간에 이용 내역이 없습니다." : "이용 내역이 없습니다."}
              </p>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {data.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!data.hasPrevPage || isFetching}
              className="px-3 py-2 min-h-[40px] border border-border/20 rounded-lg font-light disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted-foreground/10 transition-colors active:scale-95"
            >
              이전
            </button>

            <div className="flex space-x-1">
              {(() => {
                const pages = [];
                const start = Math.max(1, currentPage - 2);
                const end = Math.min(data.totalPages, currentPage + 2);

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
                      <span key="start-ellipsis" className="px-2 py-2 font-light text-muted-foreground/60">
                        ...
                      </span>
                    );
                  }
                }

                for (let i = start; i <= end; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      disabled={isFetching}
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

                if (end < data.totalPages) {
                  if (end < data.totalPages - 1) {
                    pages.push(
                      <span key="end-ellipsis" className="px-2 py-2 font-light text-muted-foreground/60">
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

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!data.hasNextPage || isFetching}
              className="px-3 py-2 min-h-[40px] border border-border/20 rounded-lg font-light disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted-foreground/10 transition-colors active:scale-95"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
