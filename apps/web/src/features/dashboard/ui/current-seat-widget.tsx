"use client";
import React from "react";
import { CurrentSeatWidgetProps } from "@pnu-blace/types";
import { SeatInfoDisplay } from "./seat-info-display";
import { SeatActionButtons } from "./seat-action-buttons";
import { NoSeatMessage } from "./no-seat-message";
import { LoadingState } from "./loading-state";
import { ErrorState } from "./error-state";
import { getStatusBadge } from "./status-badge";
import { AutoExtensionWidget } from "./auto-extension-widget";
import { createSeatCancelHandler, createSeatExtendHandler } from "../lib/seat-handlers";
import { useRealTimeRemaining } from "../lib/use-real-time-remaining";
import { toast } from "sonner";


export const CurrentSeatWidget: React.FC<CurrentSeatWidgetProps> = ({
  currentSeat,
  isLoading,
  error,
  cancelReservation: cancelReservationProp,
  extendReservation: extendReservationProp,
  isExtending,
  isCancelling,
}) => {
  // 실시간 남은 시간 계산
  const { remainingMinutes: realTimeRemainingMinutes, remainingSeconds } = useRealTimeRemaining({
    endTime: currentSeat?.endTime,
    initialRemainingMinutes: currentSeat?.remainingMinutes || 0,
  });

  // 연장 가능 여부 (2시간 = 120분 이하일 때)
  const isExtendDisabled = realTimeRemainingMinutes > 120;

  const handleCancelReservation = createSeatCancelHandler(
    currentSeat,
    cancelReservationProp
  );

  const handleExtendReservation = createSeatExtendHandler(
    currentSeat,
    extendReservationProp
  );

  // 비활성화된 연장 버튼 클릭 시 안내 메시지
  const handleExtendDisabledClick = () => {
    const hours = Math.floor(realTimeRemainingMinutes / 60);
    const minutes = realTimeRemainingMinutes % 60;
    toast.info("좌석 연장 안내", {
      description: `이용시간이 2시간 이하 남았을 때 연장 가능합니다. (현재 ${hours}시간 ${minutes}분 남음)`,
    });
  };

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
              remainingMinutes={realTimeRemainingMinutes}
              remainingSeconds={remainingSeconds}
              statusBadge={getStatusBadge()}
            />
            <SeatActionButtons
              onExtend={handleExtendReservation}
              onCancel={handleCancelReservation}
              isExtending={isExtending}
              isCancelling={isCancelling}
              isExtendDisabled={isExtendDisabled}
              onExtendDisabledClick={handleExtendDisabledClick}
            />
            <AutoExtensionWidget isVisible={true} />
          </div>
        ) : (
          <NoSeatMessage />
        )}
      </div>
    </section>
  );
};
