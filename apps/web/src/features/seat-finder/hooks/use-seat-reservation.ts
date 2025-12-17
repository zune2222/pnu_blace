"use client";

import { useReserveSeatMutation } from "@/entities/seat-finder";

interface UseSeatReservationOptions {
  roomNo: string;
  onSuccess?: () => void;
}

/**
 * 좌석 예약 처리를 위한 훅
 */
export function useSeatReservation({ roomNo, onSuccess }: UseSeatReservationOptions) {
  const mutation = useReserveSeatMutation(roomNo, onSuccess);

  const reserveSeat = async (seatNo: string, autoExtensionEnabled?: boolean) => {
    await mutation.mutateAsync({ seatNo, autoExtensionEnabled });
  };

  return {
    reserveSeat,
    isReserving: mutation.isPending,
  };
}
