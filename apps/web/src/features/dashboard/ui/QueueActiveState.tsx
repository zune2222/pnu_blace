"use client";

import React from "react";
import { Clock, X, AlertCircle, Users } from "lucide-react";
import { QueueStatusDto } from "@pnu-blace/types";
import {
  formatQueueStatus,
  getStatusColor,
  getRoomName,
} from "../utils/queueHelpers";

interface QueueActiveStateProps {
  queueStatus: QueueStatusDto;
  onCancel: () => void;
  isCanceling: boolean;
}

export const QueueActiveState: React.FC<QueueActiveStateProps> = ({
  queueStatus,
  onCancel,
  isCanceling,
}) => {
  const request = (queueStatus as any).emptySeatReservation;

  if (!request) {
    return null;
  }

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
              빈자리 예약 대기열 - {getRoomName(request.roomNo)}{" "}
              {request.seatNo}번
            </h3>
          </div>

          {request.status === "WAITING" && (
            <button
              onClick={onCancel}
              disabled={isCanceling}
              className="ml-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center space-x-2"
              title="대기열 취소"
            >
              {isCanceling ? (
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

          {request.status === "WAITING" && (
            <div className="flex items-start space-x-2 mt-3 p-3 rounded-lg">
              <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-200 font-light">
                좌석이 비워지면 자동으로 발권됩니다.
              </p>
            </div>
          )}

          {request.status === "FAILED" && (
            <div className="flex items-start space-x-2 mt-3 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-200 font-light">
                빈자리 예약에 실패했습니다. 다시 시도해 주세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
