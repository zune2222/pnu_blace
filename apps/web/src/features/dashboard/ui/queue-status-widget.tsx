"use client";

import React, { useState, useEffect } from "react";
import { Clock, X, AlertCircle, Users } from "lucide-react";
import { QueueStatusDto, QueueRequestDto } from "@pnu-blace/types";
import { dashboardApi } from "@/entities/dashboard/api";
import { toast } from "sonner";

export const QueueStatusWidget: React.FC = () => {
  const [queueStatus, setQueueStatus] = useState<QueueStatusDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  // 대기열 상태 로드
  const loadQueueStatus = async () => {
    try {
      setIsLoading(true);
      const status = await dashboardApi.getQueueStatus();
      setQueueStatus(status);
    } catch (error: any) {
      // 404는 대기열 요청이 없는 경우이므로 정상
      if (error.message?.includes('찾을 수 없습니다')) {
        setQueueStatus(null);
      } else {
        console.warn("대기열 상태 로드 실패:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueueStatus();
    
    // 10초마다 상태 업데이트
    const interval = setInterval(loadQueueStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // 대기열 요청 취소
  const handleCancelQueue = async () => {
    if (!queueStatus?.seatReservation) return;

    try {
      setIsCancelling(true);
      await dashboardApi.cancelQueueRequest();
      setQueueStatus(null);
      toast.success("빈자리 예약 대기열에서 취소되었습니다");
    } catch (error: any) {
      toast.error("취소 요청에 실패했습니다: " + error.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const formatQueueStatus = (status: string) => {
    switch (status) {
      case 'WAITING':
        return '대기 중';
      case 'PROCESSING':
        return '처리 중';
      case 'COMPLETED':
        return '완료';
      case 'FAILED':
        return '실패';
      case 'CANCELED':
        return '취소됨';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WAITING':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950/50';
      case 'PROCESSING':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-950/50';
      case 'COMPLETED':
        return 'text-green-600 bg-green-50 dark:bg-green-950/50';
      case 'FAILED':
        return 'text-red-600 bg-red-50 dark:bg-red-950/50';
      case 'CANCELED':
        return 'text-gray-600 bg-gray-50 dark:bg-gray-950/50';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-950/50';
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

  // 대기열에 등록된 요청이 없는 경우
  if (!queueStatus?.seatReservation) {
    return null;
  }

  const request = queueStatus.seatReservation;

  return (
    <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-blue-500" />
          <h3 className="font-medium text-sm text-gray-900 dark:text-white">
            빈자리 예약 대기열
          </h3>
        </div>
        {request.status === 'WAITING' && (
          <button
            onClick={handleCancelQueue}
            disabled={isCancelling}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            title="대기열 취소"
          >
            {isCancelling ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <X className="w-4 h-4 text-gray-500" />
            )}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* 좌석 정보 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">좌석</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {request.roomNo} {request.seatNo}번
          </span>
        </div>

        {/* 상태 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">상태</span>
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(request.status)}`}>
            {formatQueueStatus(request.status)}
          </span>
        </div>

        {/* 대기열 순서 */}
        {request.status === 'WAITING' && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">대기 순서</span>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {request.queuePosition}번째
            </span>
          </div>
        )}

        {/* 등록 시간 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">등록 시간</span>
          <span className="text-sm text-gray-900 dark:text-white">
            {new Date(request.createdAt).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>

        {/* 안내 메시지 */}
        {request.status === 'WAITING' && (
          <div className="flex items-start space-x-2 mt-3 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-md">
            <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              좌석이 비워지면 자동으로 발권됩니다. {queueStatus.totalWaiting > 1 && 
              `현재 총 ${queueStatus.totalWaiting}명이 대기 중입니다.`}
            </p>
          </div>
        )}

        {/* 실패한 경우 */}
        {request.status === 'FAILED' && (
          <div className="flex items-start space-x-2 mt-3 p-2 bg-red-50 dark:bg-red-950/30 rounded-md">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-700 dark:text-red-300">
              빈자리 예약에 실패했습니다. 다시 시도해 주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};