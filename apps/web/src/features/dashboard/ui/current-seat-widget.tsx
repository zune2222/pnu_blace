"use client";
import React from "react";
import { CurrentSeatWidgetProps } from "@pnu-blace/types";
import { SeatInfoDisplay } from "./seat-info-display";
import { SeatActionButtons } from "./seat-action-buttons";
import { NoSeatMessage } from "./no-seat-message";
import { LoadingState } from "./loading-state";
import { ErrorState } from "./error-state";
import { getStatusBadge } from "./status-badge";
import { createSeatCancelHandler, createSeatExtendHandler } from "../lib/seat-handlers";


export const CurrentSeatWidget: React.FC<CurrentSeatWidgetProps> = ({
  currentSeat,
  isLoading,
  error,
  cancelReservation: cancelReservationProp,
  extendReservation: extendReservationProp,
  isExtending,
  isCancelling,
}) => {
  const handleCancelReservation = createSeatCancelHandler(
    currentSeat,
    cancelReservationProp
  );

  const handleExtendReservation = createSeatExtendHandler(
    currentSeat,
    extendReservationProp
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  const isReserved = currentSeat !== null;

  return (
    <section className="py-20 md:py-32">
      <div className="max-w-4xl mx-auto">
        {isReserved ? (
          <div className="space-y-8">
            <SeatInfoDisplay
              roomName={currentSeat.roomName}
              seatDisplayName={currentSeat.seatDisplayName}
              remainingMinutes={currentSeat.remainingMinutes}
              statusBadge={getStatusBadge()}
            />
            <SeatActionButtons
              onExtend={handleExtendReservation}
              onCancel={handleCancelReservation}
              isExtending={isExtending}
              isCancelling={isCancelling}
            />
          </div>
        ) : (
          <NoSeatMessage />
        )}
      </div>
    </section>
  );
};
