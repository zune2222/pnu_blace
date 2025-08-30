"use client";

import React, { useState } from "react";
import { Clock, X, AlertCircle, Users } from "lucide-react";
import { QueueStatusDto } from "@pnu-blace/types";
import { dashboardApi } from "@/entities/dashboard/api";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const QueueStatusWidget: React.FC = () => {
  const queryClient = useQueryClient();

  // React Query로 대기열 상태 조회 (10초마다 자동 폴링)
  const {
    data: queueStatus,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["queueStatus"],
    queryFn: async (): Promise<QueueStatusDto | null> => {
      try {
        const status = await dashboardApi.getQueueStatus();
        console.log("대기열 상태 로드 성공:", status);
        return status;
      } catch (error: any) {
        console.log("대기열 상태 로드 에러:", error);
        // 404는 대기열 요청이 없는 경우이므로 정상
        if (error.message?.includes("찾을 수 없습니다")) {
          return null;
        } else {
          console.warn("대기열 상태 로드 실패:", error);
          throw error;
        }
      }
    },
    refetchInterval: 10000, // 10초마다 자동 폴링
    retry: false, // 404 에러는 재시도하지 않음
  });

  // 대기열 요청 취소 뮤테이션
  const cancelQueueMutation = useMutation({
    mutationFn: async () => {
      await dashboardApi.cancelQueueRequest();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queueStatus"] });
      toast.success("빈자리 예약 대기열에서 취소되었습니다");
    },
    onError: (error: any) => {
      toast.error("취소 요청에 실패했습니다: " + error.message);
    },
  });

  // 대기열 요청 취소
  const handleCancelQueue = async () => {
    if (!queueStatus?.seatReservation) return;
    cancelQueueMutation.mutate();
  };

  const formatQueueStatus = (status: string) => {
    switch (status) {
      case "WAITING":
        return "대기 중";
      case "PROCESSING":
        return "처리 중";
      case "COMPLETED":
        return "완료";
      case "FAILED":
        return "실패";
      case "CANCELED":
        return "취소됨";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WAITING":
        return "text-blue-600 bg-blue-50 dark:bg-blue-950/50";
      case "PROCESSING":
        return "text-orange-600 bg-orange-50 dark:bg-orange-950/50";
      case "COMPLETED":
        return "text-green-600 bg-green-50 dark:bg-green-950/50";
      case "FAILED":
        return "text-red-600 bg-red-50 dark:bg-red-950/50";
      case "CANCELED":
        return "text-gray-600 bg-gray-50 dark:bg-gray-950/50";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950/50";
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  // 대기열 상태 표시
  console.log("QueueStatusWidget 렌더링 - queueStatus:", queueStatus);
  console.log(
    "QueueStatusWidget 렌더링 - seatReservation:",
    queueStatus?.seatReservation
  );

  // 대기열에 등록된 요청이 없는 경우 - 빈 상태 메시지 표시
  if (!queueStatus?.seatReservation) {
    return (
      <div className="py-6 border-b border-border/10">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="text-muted-foreground/70">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs px-2 py-1 rounded-full font-medium tracking-wide bg-gray-500/10 text-gray-600 dark:bg-gray-400/10 dark:text-gray-400">
              QUEUE
            </span>
          </div>

          <h3 className="text-lg font-light text-foreground">
            빈자리 예약 대기열
          </h3>

          <p className="text-base text-muted-foreground/80 font-light leading-relaxed pl-8">
            현재 대기열에 등록된 요청이 없습니다
          </p>
        </div>
      </div>
    );
  }

  const request = queueStatus.seatReservation;

  return (
    <div className="py-6 border-b border-border/10">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-3">
              <div className="text-muted-foreground/70">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs px-2 py-1 rounded-full font-medium tracking-wide bg-gray-500/10 text-gray-600 dark:bg-gray-400/10 dark:text-gray-400">
                QUEUE
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium tracking-wide ${getStatusColor(request.status)}`}
              >
                {formatQueueStatus(request.status)}
              </span>
            </div>

            <h3 className="text-lg font-light text-foreground">
              빈자리 예약 대기열 - {request.roomNo} {request.seatNo}번
            </h3>
          </div>

          {/* 취소 버튼 */}
          {request.status === "WAITING" && (
            <button
              onClick={handleCancelQueue}
              disabled={cancelQueueMutation.isPending}
              className="ml-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center space-x-2"
              title="대기열 취소"
            >
              {cancelQueueMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <X className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    취소
                  </span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="pl-8 space-y-2">
          {/* 대기열 순서 */}
          {request.status === "WAITING" && (
            <p className="text-base text-muted-foreground/80 font-light leading-relaxed">
              대기 순서:{" "}
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {request.queuePosition + 1}번째
              </span>
              {queueStatus.totalWaiting > 1 && (
                <span className="text-muted-foreground/60">
                  {" "}
                  (총 {queueStatus.totalWaiting}명 대기 중)
                </span>
              )}
            </p>
          )}

          {/* 안내 메시지 */}
          {request.status === "WAITING" && (
            <div className="flex items-start space-x-2 mt-3 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg">
              <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300 font-light">
                좌석이 비워지면 자동으로 발권됩니다.
              </p>
            </div>
          )}

          {/* 실패한 경우 */}
          {request.status === "FAILED" && (
            <div className="flex items-start space-x-2 mt-3 p-3 bg-red-50/50 dark:bg-red-950/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300 font-light">
                빈자리 예약에 실패했습니다. 다시 시도해 주세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
