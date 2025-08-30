"use client";

import React from "react";
import { useQueueStatus } from "../hooks/useQueueStatus";
import { QueueEmptyState } from "./QueueEmptyState";
import { QueueActiveState } from "./QueueActiveState";

export const QueueStatusWidget: React.FC = () => {
  const { queueStatus, isLoading, cancelQueue, isCanceling } = useQueueStatus();

  if (isLoading) {
    return <></>;
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
