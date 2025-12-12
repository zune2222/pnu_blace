"use client";

import { useEffect } from "react";

interface SeatClickMessage {
  type: "SEAT_CLICK";
  seatNo: string;
}

/**
 * iframe에서 좌석 클릭 이벤트를 수신하는 훅
 * @param onSeatClick 좌석 클릭 시 호출되는 콜백
 */
export function useIframeSeatClick(onSeatClick: (seatNo: string) => void) {
  useEffect(() => {
    const handleMessage = (event: MessageEvent<SeatClickMessage>) => {
      if (event.data && event.data.type === "SEAT_CLICK") {
        onSeatClick(event.data.seatNo);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onSeatClick]);
}
