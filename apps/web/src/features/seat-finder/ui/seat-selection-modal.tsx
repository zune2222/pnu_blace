"use client";

import { useState, useEffect } from "react";
import { X, Clock, Calendar, AlertCircle } from "lucide-react";
import { SeatDetailDto, SeatVacancyPredictionDto } from "@pnu-blace/types";
import { apiClient } from "@/lib/api";

interface SeatSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSeat: string | null;
  roomNo: string;
  seatData: SeatDetailDto | null;
  onReserveSeat: (seatNo: string) => Promise<void>;
  onReserveEmptySeat: (seatNo: string) => Promise<void>;
}

export const SeatSelectionModal = ({
  isOpen,
  onClose,
  selectedSeat,
  roomNo,
  seatData,
  onReserveSeat,
  onReserveEmptySeat,
}: SeatSelectionModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [actionType, setActionType] = useState<
    "reserve" | "reserve-empty" | null
  >(null);
  const [prediction, setPrediction] = useState<SeatVacancyPredictionDto | null>(
    null
  );
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);

  const isSeatOccupied =
    seatData?.occupiedSeats.includes(selectedSeat || "") || false;
  const isSeatUnavailable =
    seatData?.unavailableSeats.includes(selectedSeat || "") || false;
  const isSeatAvailable =
    seatData?.availableSeats.includes(selectedSeat || "") || false;

  // 예측 시간 가져오기
  useEffect(() => {
    if (isOpen && selectedSeat && seatData && isSeatOccupied) {
      const fetchPrediction = async () => {
        try {
          setIsLoadingPrediction(true);
          const predictionData = await apiClient.get<SeatVacancyPredictionDto>(
            `/api/v1/seats/${roomNo}/${selectedSeat}/prediction`
          );
          setPrediction(predictionData);
        } catch (error) {
          console.error("Failed to fetch prediction:", error);
          setPrediction(null);
        } finally {
          setIsLoadingPrediction(false);
        }
      };

      fetchPrediction();
    } else {
      setPrediction(null);
    }
  }, [isOpen, selectedSeat, roomNo, isSeatOccupied]);

  // 예측 시간 포맷팅
  const getPredictedTime = () => {
    if (!prediction) return "예측 중...";

    const predictedTime = new Date(prediction.predictedEndTime);
    return predictedTime.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAction = async (type: "reserve" | "reserve-empty") => {
    try {
      setIsLoading(true);
      setActionType(type);

      if (type === "reserve") {
        await onReserveSeat(selectedSeat);
      } else {
        await onReserveEmptySeat(selectedSeat);
      }

      onClose();
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  };

  if (!isOpen || !selectedSeat || !seatData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-light text-gray-900 dark:text-white">
              좌석 선택
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {seatData.roomName} • {selectedSeat}번
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* 좌석 상태 표시 */}
          <div className="mb-6">
            {isSeatOccupied && (
              <div className="flex items-start space-x-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-900 dark:text-red-100">
                    현재 사용 중인 좌석
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    다른 사용자가 현재 이 좌석을 사용하고 있습니다.
                  </p>
                </div>
              </div>
            )}

            {isSeatAvailable && (
              <div className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-green-900 dark:text-green-100">
                    이용 가능한 좌석
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    지금 바로 예약할 수 있습니다.
                  </p>
                </div>
              </div>
            )}

            {isSeatUnavailable && (
              <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl">
                <AlertCircle className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    사용 불가능한 좌석
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    고정석 또는 점검 중인 좌석입니다.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 예측 시간 (사용 중인 좌석인 경우) */}
          {isSeatOccupied && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    예상 반납 시간
                  </h3>
                  <p className="text-lg font-light text-blue-700 dark:text-blue-300">
                    {isLoadingPrediction ? "예측 중..." : getPredictedTime()}
                  </p>
                  {prediction && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      신뢰도: {Math.round(prediction.confidence * 100)}%
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="space-y-3">
            {isSeatAvailable && (
              <button
                onClick={() => handleAction("reserve")}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                  isLoading && actionType === "reserve"
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 active:scale-[0.98]"
                }`}
              >
                {isLoading && actionType === "reserve"
                  ? "예약 중..."
                  : "좌석 발권하기"}
              </button>
            )}

            {isSeatOccupied && (
              <button
                onClick={() => handleAction("reserve-empty")}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                  isLoading && actionType === "reserve-empty"
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700 active:scale-[0.98]"
                }`}
              >
                {isLoading && actionType === "reserve-empty"
                  ? "예약 중..."
                  : "빈자리 발권 예약하기"}
              </button>
            )}

            {isSeatUnavailable && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  이 좌석은 현재 예약할 수 없습니다.
                </p>
              </div>
            )}
          </div>

          {/* 안내 메시지 */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-start space-x-2">
              <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                <p>• 좌석 발권: 즉시 사용 가능한 좌석을 예약합니다.</p>
                <p>
                  • 빈자리 발권 예약: 현재 사용 중인 좌석이 비워지면 자동으로
                  예약됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
