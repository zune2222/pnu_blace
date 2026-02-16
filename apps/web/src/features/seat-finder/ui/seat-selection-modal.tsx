"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { SeatDetailDto } from "@pnu-blace/types";
import { useSeatPrediction } from "@/entities/seat-finder";
import { logger } from "@/shared/lib/logger";
import { SeatStatusAlert } from "./seat-status-alert";
import { PredictionDisplay } from "./prediction-display";
import {
  ReserveButton,
  OccupiedNotice,
  UnavailableNotice,
  SeatInfoFooter,
} from "./seat-actions";

interface SeatSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSeat: string | null;
  roomNo: string;
  seatData: SeatDetailDto | null;
  onReserveSeat: (
    seatNo: string,
    autoExtensionEnabled?: boolean,
  ) => Promise<void>;
}

export const SeatSelectionModal = ({
  isOpen,
  onClose,
  selectedSeat,
  roomNo,
  seatData,
  onReserveSeat,
}: SeatSelectionModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [autoExtensionEnabled] = useState(false);

  const isSeatOccupied =
    seatData?.occupiedSeats.includes(selectedSeat || "") || false;
  const isSeatUnavailable =
    seatData?.unavailableSeats.includes(selectedSeat || "") || false;
  const isSeatAvailable =
    seatData?.availableSeats.includes(selectedSeat || "") || false;

  // 좌석 예측 데이터 (React Query)
  const { data: prediction, isLoading: isLoadingPrediction } =
    useSeatPrediction(
      roomNo,
      selectedSeat || "",
      isOpen && !!selectedSeat && !!seatData && isSeatOccupied,
    );

  // 모달 애니메이션 제어
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleReserve = async () => {
    if (!selectedSeat) return;
    try {
      setIsLoading(true);
      await onReserveSeat(selectedSeat, autoExtensionEnabled);
      onClose();
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string };
      if (apiError.status !== 400 && apiError.status !== 409) {
        logger.error("Unexpected action error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible || !selectedSeat || !seatData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm transition-all duration-300 ease-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white dark:bg-gray-950 rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800 transition-all duration-300 ease-out transform ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <div>
            <h2 className="text-xl font-light text-gray-900 dark:text-white">
              좌석 선택
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {seatData.roomName} • {selectedSeat}번
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 min-h-[44px] min-w-[44px] rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-white dark:bg-gray-950">
          {/* 좌석 상태 표시 */}
          <div className="mb-6 space-y-4">
            {isSeatOccupied && <SeatStatusAlert status="occupied" />}
            {isSeatAvailable && <SeatStatusAlert status="available" />}
            {isSeatUnavailable && <SeatStatusAlert status="unavailable" />}
          </div>

          {/* 예측 시간 */}
          {isSeatOccupied && (
            <div className="mb-6">
              <PredictionDisplay
                isLoading={isLoadingPrediction}
                prediction={prediction}
              />
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300 delay-200">
            {isSeatAvailable && (
              <ReserveButton onClick={handleReserve} isLoading={isLoading} />
            )}
            {isSeatOccupied && <OccupiedNotice />}
            {isSeatUnavailable && <UnavailableNotice />}
          </div>

          {/* 안내 메시지 */}
          <SeatInfoFooter />
        </div>
      </div>
    </div>
  );
};
