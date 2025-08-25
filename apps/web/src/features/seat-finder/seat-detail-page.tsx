"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import {
  SeatDetailDto,
  ReserveSeatRequestDto,
  SeatActionResponseDto,
} from "@pnu-blace/types";
import { apiClient } from "@/lib/api";
import { SeatSelectionModal } from "./ui";
import React from "react"; // Added for React.Fragment

interface SeatDetailPageProps {
  roomNo: string;
}

export const SeatDetailPage = ({ roomNo }: SeatDetailPageProps) => {
  const router = useRouter();
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isReserving, setIsReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seatData, setSeatData] = useState<SeatDetailDto | null>(null);

  const handleSeatClick = useCallback((seatNo: string) => {
    setSelectedSeat(seatNo);
    setIsModalOpen(true);
  }, []);

  useEffect(() => {
    const fetchSeatData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log("Fetching seat data for room:", roomNo);

        const data = await apiClient.get<SeatDetailDto>(
          `/api/v1/seats/${roomNo}/detail`
        );
        console.log("Seat data received:", data);
        setSeatData(data);
      } catch (err: any) {
        console.error("Error fetching seat data:", err);
        setError(err.message || "좌석 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeatData();
  }, [roomNo]);

  // iframe으로부터 메시지 받기
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "SEAT_CLICK") {
        const seatNo = event.data.seatNo;
        console.log("Seat clicked from iframe:", seatNo);
        handleSeatClick(seatNo);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleSeatClick]);

  const handleReserveSeat = async (seatNo: string) => {
    try {
      setIsReserving(true);
      setError(null);

      const reserveRequest: ReserveSeatRequestDto = {
        roomNo,
        setNo: seatNo,
      };

      const response = await apiClient.post<SeatActionResponseDto>(
        "/api/v1/seats/reserve",
        reserveRequest
      );

      if (response.success) {
        // 예약 성공 시 좌석 데이터 새로고침
        const updatedData = await apiClient.get<SeatDetailDto>(
          `/api/v1/seats/${roomNo}/detail`
        );
        setSeatData(updatedData);
        setSelectedSeat(null);

        // 성공 메시지 표시 (실제로는 토스트나 알림 사용)
        alert("좌석이 성공적으로 발권되었습니다!");
      }
    } catch (err: any) {
      // 정상적인 비즈니스 로직 에러는 콘솔에 출력하지 않음
      let errorMessage = "좌석 발권에 실패했습니다.";

      if (err.status === 409) {
        // 백엔드에서 제공하는 상세한 메시지 사용
        errorMessage = err.message || "이미 발권된 좌석이 있습니다.";
      } else if (err.status === 400) {
        errorMessage = "발권 정보가 올바르지 않습니다.";
      } else if (err.message) {
        errorMessage = err.message;
        // 예상치 못한 에러만 콘솔에 출력
        console.error("Unexpected reservation error:", err);
      }

      setError(errorMessage);
      throw err; // 모달에서 에러를 처리할 수 있도록 다시 던짐
    } finally {
      setIsReserving(false);
    }
  };

  const handleReserveEmptySeat = async (seatNo: string) => {
    try {
      setIsReserving(true);
      setError(null);

      // 빈자리 예약 API 호출 (실제로는 별도 엔드포인트 필요)
      const reserveRequest: ReserveSeatRequestDto = {
        roomNo,
        setNo: seatNo,
      };

      const response = await apiClient.post<SeatActionResponseDto>(
        "/api/v1/seats/reserve-empty",
        reserveRequest
      );

      if (response.success) {
        // 예약 성공 시 좌석 데이터 새로고침
        const updatedData = await apiClient.get<SeatDetailDto>(
          `/api/v1/seats/${roomNo}/detail`
        );
        setSeatData(updatedData);
        setSelectedSeat(null);

        // 성공 메시지 표시
        alert(
          "빈자리 발권 예약이 완료되었습니다. 좌석이 비워지면 자동으로 발권됩니다."
        );
      }
    } catch (err: any) {
      // 정상적인 비즈니스 로직 에러는 콘솔에 출력하지 않음
      let errorMessage = "빈자리 발권 예약에 실패했습니다.";

      if (err.status === 409) {
        // 백엔드에서 제공하는 상세한 메시지 사용
        errorMessage = err.message || "이미 발권된 좌석이 있습니다.";
      } else if (err.status === 400) {
        errorMessage = "발권 정보가 올바르지 않습니다.";
      } else if (err.message) {
        errorMessage = err.message;
        // 예상치 못한 에러만 콘솔에 출력
        console.error("Unexpected empty seat reservation error:", err);
      }

      setError(errorMessage);
      throw err;
    } finally {
      setIsReserving(false);
    }
  };

  const getSeatStatus = (seatNo: string) => {
    if (!seatData) return "unknown";

    if (seatData.occupiedSeats.includes(seatNo)) return "occupied";
    if (seatData.unavailableSeats.includes(seatNo)) return "fixed";
    if (selectedSeat === seatNo) return "selected";
    return "available";
  };

  const renderSeat = (seatNo: string) => {
    const seatNoStr = seatNo.toString();
    return (
      <button
        key={seatNoStr}
        onClick={() => handleSeatClick(seatNoStr)}
        className={getSeatClassName(seatNoStr)}
      >
        {seatNoStr}
      </button>
    );
  };

  const getSeatClassName = (seatNo: string) => {
    const baseClasses =
      "w-7 h-9 rounded border flex items-center justify-center text-xs font-medium transition-all duration-200 cursor-pointer backdrop-blur-sm";
    const status = getSeatStatus(seatNo);

    switch (status) {
      case "fixed":
        return `${baseClasses} border-gray-400 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed bg-gray-100/80 dark:bg-gray-800/80`;
      case "occupied":
        return `${baseClasses} border-red-400 dark:border-red-500 text-red-600 dark:text-red-400 cursor-not-allowed bg-red-100/80 dark:bg-red-900/20`;
      case "selected":
        return `${baseClasses} border-blue-600 dark:border-blue-400 text-blue-700 dark:text-blue-300 bg-blue-200/90 dark:bg-blue-900/30 shadow-lg scale-110`;
      case "available":
        return `${baseClasses} border-green-400 dark:border-green-500 text-green-700 dark:text-green-400 hover:bg-green-100/90 dark:hover:bg-green-900/20 hover:border-green-500 dark:hover:border-green-400 hover:scale-105 bg-white/80 dark:bg-gray-800/80`;
      default:
        return `${baseClasses} bg-white/80 dark:bg-gray-800/80`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">좌석 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !seatData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            {error || "좌석 정보를 찾을 수 없습니다."}
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* 헤더 */}
        <div className="border-b border-border/20">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 group"
                  style={{
                    backgroundColor:
                      document.documentElement.classList.contains("dark")
                        ? "transparent"
                        : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (document.documentElement.classList.contains("dark")) {
                      e.currentTarget.style.backgroundColor =
                        "rgba(31, 41, 55, 0.8)";
                    } else {
                      e.currentTarget.style.backgroundColor =
                        "rgba(243, 244, 246, 0.8)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <ArrowLeft className="w-5 h-5 text-foreground transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                </button>
                <div>
                  <h1 className="text-2xl font-light text-foreground">
                    {seatData.roomName}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    총 {seatData.totalSeats}석 • 사용 중{" "}
                    {seatData.occupiedSeats.length}석
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="py-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* 범례 */}
        <div className="py-6">
          <h3 className="text-sm font-light text-foreground mb-6 tracking-wide uppercase">
            좌석 상태
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-lg bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-500"></div>
              <span className="text-sm text-foreground font-light">
                이용 가능
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-lg bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-500"></div>
              <span className="text-sm text-foreground font-light">
                사용 중
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-lg bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600"></div>
              <span className="text-sm text-foreground font-light">
                사용 불가
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-lg bg-blue-500 dark:bg-blue-600 border-2 border-blue-600 dark:border-blue-400"></div>
              <span className="text-sm text-foreground font-light">선택됨</span>
            </div>
          </div>
        </div>

        {/* 좌석 배치도 - 부산대학교 실제 구조 반영 */}
        <div className="py-6">
          <div className="bg-white dark:bg-gray-900 border border-border/20 rounded-lg p-8 overflow-auto shadow-sm dark:shadow-gray-900/20">
            <div className="relative min-h-[900px] flex justify-center">
              {/* 좌석 배치도 */}
              <div className="relative z-10 w-full">
                {/* 백엔드에서 제공하는 HTML을 iframe으로 표시 (배경 이미지 포함) */}
                <iframe
                  src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/seats/${roomNo}/html`}
                  title={`${seatData?.roomName || "열람실"} 좌석 배치도`}
                  className="w-full border-0 rounded-lg shadow-lg"
                  style={{
                    height: "2000px", // 더 큰 높이로 설정
                    minHeight: "1500px",
                    minWidth: "1200px", // 최소 너비 설정
                  }}
                  scrolling="auto"
                  onLoad={() => {
                    console.log("Seat layout iframe loaded successfully");
                  }}
                  onError={(e) => {
                    console.error("Seat layout iframe failed to load:", e);
                    console.error(
                      "Failed URL:",
                      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/seats/${roomNo}/html`
                    );
                    console.error("Error details:", e);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="py-6">
          <div className="flex items-start space-x-4">
            <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-3">
              <h3 className="text-lg font-light text-foreground">
                좌석 예약 안내
              </h3>
              <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">
                <p>
                  원하는 좌석을 클릭하여 선택한 후 예약하기 버튼을 눌러주세요.
                </p>
                <p>
                  예약은 실시간으로 처리되며, 다른 사용자가 먼저 예약할 수
                  있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 좌석 선택 모달 */}
      <SeatSelectionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSeat(null);
        }}
        selectedSeat={selectedSeat}
        roomNo={roomNo}
        seatData={seatData}
        onReserveSeat={handleReserveSeat}
        onReserveEmptySeat={handleReserveEmptySeat}
      />
    </div>
  );
};
