"use client";

import React from "react";
import { useQueueStatus } from "../hooks/useQueueStatus";
import { QueueEmptyState } from "./QueueEmptyState";
import { QueueActiveState } from "./QueueActiveState";

export const QueueStatusWidget: React.FC = () => {
  const { queueStatus, isLoading, cancelQueue, isCanceling } = useQueueStatus();

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

  if (!(queueStatus as any)?.emptySeatReservation) {
    return <QueueEmptyState />;
  }

  return (
    <QueueActiveState
      queueStatus={queueStatus!}
      onCancel={cancelQueue}
      isCanceling={isCanceling}
    />
  );
};
