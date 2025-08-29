"use client";

import { useState, useEffect } from "react";
import { X, Clock, Calendar, AlertCircle } from "lucide-react";
import { SeatDetailDto, SeatPredictionDto } from "@pnu-blace/types";
import { apiClient } from "@/lib/api";

interface SeatSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSeat: string | null;
  roomNo: string;
  seatData: SeatDetailDto | null;
  onReserveSeat: (seatNo: string, autoExtensionEnabled?: boolean) => Promise<void>;
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
  const [prediction, setPrediction] = useState<SeatPredictionDto | null>(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [autoExtensionEnabled, setAutoExtensionEnabled] = useState(false);

  const isSeatOccupied =
    seatData?.occupiedSeats.includes(selectedSeat || "") || false;
  const isSeatUnavailable =
    seatData?.unavailableSeats.includes(selectedSeat || "") || false;
  const isSeatAvailable =
    seatData?.availableSeats.includes(selectedSeat || "") || false;

  // 모달 애니메이션 제어
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 200); // 애니메이션 완료 후 숨김
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 예측 시간 가져오기
  useEffect(() => {
    if (isOpen && selectedSeat && seatData && isSeatOccupied) {
      const fetchPrediction = async () => {
        try {
          setIsLoadingPrediction(true);
          const predictionData = await apiClient.get<SeatPredictionDto>(
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

    // SeatPredictionDto의 분석 결과를 기반으로 메시지 생성
    const analysis = prediction.analysis;
    if (analysis) {
      return `평균 ${analysis.averageUtilization}% 사용률, 추천 시간: ${analysis.recommendedTimes.slice(0, 2).join(", ")}`;
    }
    return "분석 중...";
  };

  const handleAction = async (type: "reserve" | "reserve-empty") => {
    if (!selectedSeat) return;

    try {
      setIsLoading(true);
      setActionType(type);

      if (type === "reserve") {
        await onReserveSeat(selectedSeat, autoExtensionEnabled);
      } else {
        await onReserveEmptySeat(selectedSeat);
      }

      onClose();
    } catch (error: any) {
      // 정상적인 비즈니스 로직 에러는 콘솔에 출력하지 않음
      // 예상치 못한 에러만 콘솔에 출력
      if (error.status !== 409 && error.status !== 400) {
        console.error("Unexpected action error:", error);
      }
    } finally {
      setIsLoading(false);
      setActionType(null);
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
        className={`relative bg-white dark:bg-gray-950 rounded-2xl shadow-2xl dark:shadow-black/80 max-w-md w-full mx-4 overflow-hidden transition-all duration-300 ease-out transform border border-gray-200 dark:border-gray-800 ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
        style={{
          backgroundColor: document.documentElement.classList.contains("dark")
            ? "#0a0a0a"
            : "#ffffff",
          borderColor: document.documentElement.classList.contains("dark")
            ? "#1f2937"
            : "#e5e7eb",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
          style={{
            backgroundColor: document.documentElement.classList.contains("dark")
              ? "#111827"
              : "#f9fafb",
            borderBottomColor: document.documentElement.classList.contains(
              "dark"
            )
              ? "#1f2937"
              : "#e5e7eb",
          }}
        >
          <div>
            <h2
              className="text-xl font-light text-gray-900 dark:text-white"
              style={{
                color: document.documentElement.classList.contains("dark")
                  ? "#ffffff"
                  : "#111827",
              }}
            >
              좌석 선택
            </h2>
            <p
              className="text-sm text-gray-600 dark:text-gray-300 mt-1"
              style={{
                color: document.documentElement.classList.contains("dark")
                  ? "#d1d5db"
                  : "#4b5563",
              }}
            >
              {seatData.roomName} • {selectedSeat}번
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-200 hover:scale-110 active:scale-95"
            style={{
              backgroundColor: document.documentElement.classList.contains(
                "dark"
              )
                ? "transparent"
                : "transparent",
            }}
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div
          className="p-6 bg-white dark:bg-gray-950"
          style={{
            backgroundColor: document.documentElement.classList.contains("dark")
              ? "#0a0a0a"
              : "#ffffff",
          }}
        >
          {/* 좌석 상태 표시 */}
          <div className="mb-6 space-y-4">
            {isSeatOccupied && (
              <div
                className="flex items-start space-x-3 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl animate-in slide-in-from-top-2 duration-300"
                style={{
                  backgroundColor: document.documentElement.classList.contains(
                    "dark"
                  )
                    ? "rgba(127, 29, 29, 0.5)"
                    : "#fef2f2",
                  borderColor: document.documentElement.classList.contains(
                    "dark"
                  )
                    ? "#991b1b"
                    : "#fecaca",
                }}
              >
                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3
                    className="text-sm font-medium text-red-900 dark:text-red-100"
                    style={{
                      color: document.documentElement.classList.contains("dark")
                        ? "#fecaca"
                        : "#7f1d1d",
                    }}
                  >
                    현재 사용 중인 좌석
                  </h3>
                  <p
                    className="text-sm text-red-700 dark:text-red-300 mt-1"
                    style={{
                      color: document.documentElement.classList.contains("dark")
                        ? "#fca5a5"
                        : "#b91c1c",
                    }}
                  >
                    다른 사용자가 현재 이 좌석을 사용하고 있습니다.
                  </p>
                </div>
              </div>
            )}

            {isSeatAvailable && (
              <div
                className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-xl animate-in slide-in-from-top-2 duration-300"
                style={{
                  backgroundColor: document.documentElement.classList.contains(
                    "dark"
                  )
                    ? "rgba(5, 46, 22, 0.5)"
                    : "#f0fdf4",
                  borderColor: document.documentElement.classList.contains(
                    "dark"
                  )
                    ? "#166534"
                    : "#bbf7d0",
                }}
              >
                <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mt-2 flex-shrink-0 animate-pulse" />
                <div>
                  <h3
                    className="text-sm font-medium text-green-900 dark:text-green-100"
                    style={{
                      color: document.documentElement.classList.contains("dark")
                        ? "#bbf7d0"
                        : "#14532d",
                    }}
                  >
                    이용 가능한 좌석
                  </h3>
                  <p
                    className="text-sm text-green-700 dark:text-green-300 mt-1"
                    style={{
                      color: document.documentElement.classList.contains("dark")
                        ? "#86efac"
                        : "#15803d",
                    }}
                  >
                    지금 바로 예약할 수 있습니다.
                  </p>
                </div>
              </div>
            )}

            {isSeatUnavailable && (
              <div
                className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl animate-in slide-in-from-top-2 duration-300"
                style={{
                  backgroundColor: document.documentElement.classList.contains(
                    "dark"
                  )
                    ? "rgba(17, 24, 39, 0.5)"
                    : "#f9fafb",
                  borderColor: document.documentElement.classList.contains(
                    "dark"
                  )
                    ? "#1f2937"
                    : "#e5e7eb",
                }}
              >
                <AlertCircle className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3
                    className="text-sm font-medium text-gray-900 dark:text-gray-100"
                    style={{
                      color: document.documentElement.classList.contains("dark")
                        ? "#f3f4f6"
                        : "#111827",
                    }}
                  >
                    사용 불가능한 좌석
                  </h3>
                  <p
                    className="text-sm text-gray-700 dark:text-gray-300 mt-1"
                    style={{
                      color: document.documentElement.classList.contains("dark")
                        ? "#d1d5db"
                        : "#374151",
                    }}
                  >
                    고정석 또는 점검 중인 좌석입니다.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 예측 시간 (사용 중인 좌석인 경우) */}
          {isSeatOccupied && (
            <div
              className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl animate-in slide-in-from-top-2 duration-300 delay-100"
              style={{
                backgroundColor: document.documentElement.classList.contains(
                  "dark"
                )
                  ? "rgba(30, 58, 138, 0.5)"
                  : "#eff6ff",
                borderColor: document.documentElement.classList.contains("dark")
                  ? "#1e40af"
                  : "#bfdbfe",
              }}
            >
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400 animate-pulse" />
                <div className="flex-1">
                  <h3
                    className="text-sm font-medium text-blue-900 dark:text-blue-100"
                    style={{
                      color: document.documentElement.classList.contains("dark")
                        ? "#dbeafe"
                        : "#1e3a8a",
                    }}
                  >
                    사용 패턴 분석
                  </h3>
                  <p
                    className="text-sm text-blue-700 dark:text-blue-300 mt-1"
                    style={{
                      color: document.documentElement.classList.contains("dark")
                        ? "#93c5fd"
                        : "#1d4ed8",
                    }}
                  >
                    {isLoadingPrediction ? "분석 중..." : getPredictedTime()}
                  </p>
                  {prediction?.analysis && (
                    <p
                      className="text-xs text-blue-600 dark:text-blue-400 mt-1"
                      style={{
                        color: document.documentElement.classList.contains(
                          "dark"
                        )
                          ? "#60a5fa"
                          : "#2563eb",
                      }}
                    >
                      현재 기간: {prediction.analysis.currentPeriod}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 자동 연장 옵션 (이용 가능한 좌석인 경우) */}
          {isSeatAvailable && (
            <div
              className="mb-4 p-3 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 rounded-xl animate-in slide-in-from-top-2 duration-300 delay-150"
              style={{
                backgroundColor: document.documentElement.classList.contains(
                  "dark"
                )
                  ? "rgba(88, 28, 135, 0.5)"
                  : "#faf5ff",
                borderColor: document.documentElement.classList.contains("dark")
                  ? "#7c3aed"
                  : "#d8b4fe",
              }}
            >
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoExtensionEnabled}
                  onChange={(e) => setAutoExtensionEnabled(e.target.checked)}
                  className="mt-1 w-4 h-4 text-purple-600 bg-white dark:bg-gray-900 border-purple-300 dark:border-purple-700 rounded focus:ring-purple-500 dark:focus:ring-purple-400 focus:ring-2"
                />
                <div className="flex-1">
                  <h3
                    className="text-sm font-medium text-purple-900 dark:text-purple-100"
                    style={{
                      color: document.documentElement.classList.contains("dark")
                        ? "#e9d5ff"
                        : "#581c87",
                    }}
                  >
                    자동 연장 활성화
                  </h3>
                  <p
                    className="text-sm text-purple-700 dark:text-purple-300 mt-1"
                    style={{
                      color: document.documentElement.classList.contains("dark")
                        ? "#c084fc"
                        : "#7c2d12",
                    }}
                  >
                    시간이 얼마 남지 않았을 때 자동으로 연장합니다
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300 delay-200">
            {isSeatAvailable && (
              <button
                onClick={() => handleAction("reserve")}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                  isLoading && actionType === "reserve"
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 shadow-lg hover:shadow-xl dark:shadow-blue-500/25"
                }`}
              >
                {isLoading && actionType === "reserve"
                  ? "발권 중..."
                  : "좌석 발권하기"}
              </button>
            )}

            {isSeatOccupied && (
              <button
                onClick={() => handleAction("reserve-empty")}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                  isLoading && actionType === "reserve-empty"
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700 shadow-lg hover:shadow-xl dark:shadow-green-500/25"
                }`}
              >
                {isLoading && actionType === "reserve-empty"
                  ? "예약 중..."
                  : "빈자리 발권 예약하기"}
              </button>
            )}

            {isSeatUnavailable && (
              <div className="text-center py-4 animate-in fade-in duration-300 delay-300">
                <p
                  className="text-sm text-gray-500 dark:text-gray-400"
                  style={{
                    color: document.documentElement.classList.contains("dark")
                      ? "#9ca3af"
                      : "#6b7280",
                  }}
                >
                  이 좌석은 현재 예약할 수 없습니다.
                </p>
              </div>
            )}
          </div>

          {/* 안내 메시지 */}
          <div
            className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 animate-in slide-in-from-bottom-2 duration-300 delay-300"
            style={{
              borderTopColor: document.documentElement.classList.contains(
                "dark"
              )
                ? "#1f2937"
                : "#e5e7eb",
            }}
          >
            <div className="flex items-start space-x-2">
              <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
              <div
                className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed"
                style={{
                  color: document.documentElement.classList.contains("dark")
                    ? "#9ca3af"
                    : "#6b7280",
                }}
              >
                <p>• 좌석 발권: 즉시 사용 가능한 좌석을 발권합니다.</p>
                <p>
                  • 빈자리 발권 예약: 현재 사용 중인 좌석이 비워지면 자동으로
                  발권됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
