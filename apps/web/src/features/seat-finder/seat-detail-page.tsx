"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { SeatDetailDto } from "@pnu-blace/types";
import { apiClient } from "@/lib/api";
import React from "react"; // Added for React.Fragment

interface SeatDetailPageProps {
  roomNo: string;
}

export const SeatDetailPage = ({ roomNo }: SeatDetailPageProps) => {
  const router = useRouter();
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seatData, setSeatData] = useState<SeatDetailDto | null>(null);

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

  const handleSeatClick = (seatNo: string) => {
    if (selectedSeat === seatNo) {
      setSelectedSeat(null);
    } else {
      setSelectedSeat(seatNo);
    }
  };

  const handleReservation = () => {
    if (!selectedSeat) return;

    // 좌석 예약 로직 구현
    console.log(`좌석 ${selectedSeat} 예약 요청`);
    // 실제로는 API 호출하여 예약 처리
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
      "w-7 h-9 rounded border flex items-center justify-center text-xs font-medium transition-all duration-200 cursor-pointer bg-white/80 backdrop-blur-sm";
    const status = getSeatStatus(seatNo);

    switch (status) {
      case "fixed":
        return `${baseClasses} border-gray-400 text-gray-500 cursor-not-allowed bg-gray-100/80`;
      case "occupied":
        return `${baseClasses} border-red-400 text-red-600 cursor-not-allowed bg-red-100/80`;
      case "selected":
        return `${baseClasses} border-blue-600 text-blue-700 bg-blue-200/90 shadow-lg scale-110`;
      case "available":
        return `${baseClasses} border-green-400 text-green-700 hover:bg-green-100/90 hover:border-green-500 hover:scale-105`;
      default:
        return baseClasses;
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
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
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

              {selectedSeat && (
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">선택된 좌석</p>
                    <p className="text-lg font-medium text-blue-600">
                      {selectedSeat}번
                    </p>
                  </div>
                  <button
                    onClick={handleReservation}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    예약하기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 범례 */}
        <div className="py-6">
          <div className="bg-background border border-border/20 rounded-lg p-6 max-w-2xl">
            <h3 className="text-sm font-medium text-foreground mb-4 tracking-wide uppercase">
              좌석 상태
            </h3>
            <div className="flex flex-wrap gap-6 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-lg bg-green-50 border-2 border-green-200"></div>
                <span className="text-green-700 font-light">이용 가능</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-lg bg-red-100 border-2 border-red-300"></div>
                <span className="text-red-600 font-light">사용 중</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-lg bg-gray-100 border-2 border-gray-300"></div>
                <span className="text-gray-500 font-light">사용 불가</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-lg bg-blue-500 border-2 border-blue-600"></div>
                <span className="text-blue-600 font-light">선택됨</span>
              </div>
            </div>
          </div>
        </div>

        {/* 좌석 배치도 - 부산대학교 실제 구조 반영 */}
        <div className="py-6">
          <div className="bg-white dark:bg-gray-900 border border-border/20 rounded-lg p-8 overflow-auto">
            <div className="relative min-h-[900px] flex justify-center">
              {/* 좌석 배치도 */}
              <div className="relative z-10 w-full">
                {/* 백엔드에서 제공하는 HTML을 iframe으로 표시 (배경 이미지 포함) */}
                <iframe
                  src={`http://localhost:8080/api/v1/seats/${roomNo}/html`}
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
                      `http://localhost:8080/api/v1/seats/${roomNo}/html`
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
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">좌석 예약 안내</p>
                <p>
                  원하는 좌석을 클릭하여 선택한 후 예약하기 버튼을 눌러주세요.
                </p>
                <p className="mt-1">
                  예약은 실시간으로 처리되며, 다른 사용자가 먼저 예약할 수
                  있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
