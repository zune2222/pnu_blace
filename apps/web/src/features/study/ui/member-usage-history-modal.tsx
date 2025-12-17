"use client";

import React, { useState } from "react";
import { useMemberAttendanceHistory } from "@/entities/study";
import { AttendanceStatus } from "@pnu-blace/types";

interface MemberUsageHistoryModalProps {
  groupId: string;
  memberId: string;
  displayName: string;
  isOpen: boolean;
  onClose: () => void;
}

const StatusBadge: React.FC<{ status: AttendanceStatus }> = ({ status }) => {
  const config: Record<
    AttendanceStatus,
    { icon: string; label: string; className: string }
  > = {
    PRESENT: {
      icon: "✅",
      label: "출근",
      className: "text-green-600 dark:text-green-400",
    },
    LATE: {
      icon: "⚠️",
      label: "지각",
      className: "text-amber-600 dark:text-amber-400",
    },
    EARLY_LEAVE: {
      icon: "🚪",
      label: "조퇴",
      className: "text-orange-600 dark:text-orange-400",
    },
    ABSENT: {
      icon: "❌",
      label: "결석",
      className: "text-red-600 dark:text-red-400",
    },
    VACATION: {
      icon: "🏖️",
      label: "휴가",
      className: "text-blue-600 dark:text-blue-400",
    },
  };

  const { icon, label, className } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1 text-sm font-light ${className}`}
    >
      {icon} {label}
    </span>
  );
};

const formatMinutes = (minutes: number): string => {
  if (minutes === 0) return "0분";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}분`;
  if (mins === 0) return `${hours}시간`;
  return `${hours}시간 ${mins}분`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
  });
};

export const MemberUsageHistoryModal: React.FC<MemberUsageHistoryModalProps> = ({
  groupId,
  memberId,
  displayName,
  isOpen,
  onClose,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const {
    data: historyData,
    isLoading,
    error,
  } = useMemberAttendanceHistory(
    groupId,
    memberId,
    {
      page: currentPage,
      limit: 10,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    },
    isOpen
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDateFilter = () => {
    setCurrentPage(1); // Reset to first page when filtering
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/20">
          <div>
            <h2 className="text-xl font-light text-foreground">
              {displayName}님의 출석 이력
            </h2>
            {historyData?.summary && (
              <p className="text-sm text-muted-foreground/60 font-light mt-1">
                총 {historyData.summary.totalOperatingDays}일 • 출석률{" "}
                {historyData.summary.attendanceRate.toFixed(1)}%
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Filter Section */}
        <div className="p-6 border-b border-border/20 bg-muted-foreground/5">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-light text-muted-foreground/70 mb-2">
                시작 날짜
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-border/20 rounded-lg text-sm font-light focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-light text-muted-foreground/70 mb-2">
                종료 날짜
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-border/20 rounded-lg text-sm font-light focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDateFilter}
                className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-light hover:bg-foreground/90 transition-all"
              >
                필터 적용
              </button>
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-border/20 rounded-lg text-sm font-light hover:bg-muted-foreground/10 transition-all"
              >
                초기화
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {isLoading && (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground/60 font-light">
                이력을 불러오는 중...
              </p>
            </div>
          )}

          {error && (
            <div className="p-8 text-center">
              <p className="text-red-600 dark:text-red-400 font-light">
                이력을 불러오는 중 오류가 발생했습니다.
              </p>
            </div>
          )}

          {historyData && (
            <div className="p-6">
              {/* Summary Stats */}
              {historyData.summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted-foreground/5 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-light text-green-600 dark:text-green-400">
                      {historyData.summary.presentDays}
                    </p>
                    <p className="text-xs text-muted-foreground/50 font-light">
                      정상 출근
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-light text-amber-600 dark:text-amber-400">
                      {historyData.summary.lateDays}
                    </p>
                    <p className="text-xs text-muted-foreground/50 font-light">
                      지각
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-light text-red-600 dark:text-red-400">
                      {historyData.summary.absentDays}
                    </p>
                    <p className="text-xs text-muted-foreground/50 font-light">
                      결석
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-light text-foreground">
                      {formatMinutes(Math.round(historyData.summary.averageUsageMinutes))}
                    </p>
                    <p className="text-xs text-muted-foreground/50 font-light">
                      평균 이용시간
                    </p>
                  </div>
                </div>
              )}

              {/* Records List */}
              {historyData.records.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground/60 font-light">
                    해당 기간의 출석 기록이 없습니다.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyData.records.map((record) => (
                    <div
                      key={record.recordId}
                      className="flex items-center justify-between py-4 px-4 border border-border/10 rounded-lg hover:bg-muted-foreground/5 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-light text-foreground">
                            {formatDate(record.date)}
                          </p>
                          <StatusBadge status={record.status} />
                        </div>
                        {record.checkInTime && (
                          <p className="text-sm text-muted-foreground/60 font-light">
                            {record.checkInTime}
                            {record.checkOutTime && ` → ${record.checkOutTime}`}
                            {record.usageMinutes > 0 && (
                              <span className="ml-2">
                                ({formatMinutes(record.usageMinutes)})
                              </span>
                            )}
                          </p>
                        )}
                        {record.note && (
                          <p className="text-xs text-muted-foreground/50 font-light mt-1">
                            📝 {record.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {historyData.pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-3 py-1 text-sm border border-border/20 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted-foreground/10 transition-colors"
                  >
                    이전
                  </button>
                  
                  {Array.from({ length: historyData.pagination.totalPages }, (_, i) => i + 1)
                    .filter(page => 
                      page === 1 || 
                      page === historyData.pagination.totalPages || 
                      Math.abs(page - currentPage) <= 2
                    )
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="text-muted-foreground/50">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 text-sm border rounded transition-colors ${
                            page === currentPage
                              ? "bg-foreground text-background border-foreground"
                              : "border-border/20 hover:bg-muted-foreground/10"
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= historyData.pagination.totalPages}
                    className="px-3 py-1 text-sm border border-border/20 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted-foreground/10 transition-colors"
                  >
                    다음
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};