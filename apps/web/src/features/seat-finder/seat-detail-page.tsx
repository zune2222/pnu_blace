"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SeatSelectionModal } from "./ui";
import { useAuth } from "@/entities/auth";
import { logger } from "@/shared/lib/logger";
import { useSeatData, useSeatReservation, useIframeSeatClick } from "./hooks";
import { seatEvents } from "@/shared/lib/analytics";

interface SeatDetailPageProps {
  roomNo: string;
}

export const SeatDetailPage = ({ roomNo }: SeatDetailPageProps) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 커스텀 훅 사용
  const { seatData, isLoading, error } = useSeatData(roomNo);
  const { reserveSeat } = useSeatReservation({
    roomNo,
    onSuccess: () => setSelectedSeat(null),
  });

  // 룸 상세 페이지 조회 이벤트
  useEffect(() => {
    if (seatData) {
      const availableSeats = seatData.totalSeats - seatData.occupiedSeats.length;
      const utilizationRate = Math.round((seatData.occupiedSeats.length / seatData.totalSeats) * 100);

      seatEvents.roomViewed({
        room_no: roomNo,
        room_name: seatData.roomName,
        total_seats: seatData.totalSeats,
        available_seats: availableSeats,
        utilization_rate: utilizationRate,
      });
    }
  }, [seatData, roomNo]);

  // 좌석 클릭 핸들러
  const handleSeatClick = useCallback((seatNo: string) => {
    if (seatData) {
      seatEvents.bookingStarted({
        room_no: roomNo,
        room_name: seatData.roomName,
        seat_no: seatNo,
        booking_source: "room_detail",
      });
    }
    setSelectedSeat(seatNo);
    setIsModalOpen(true);
  }, [roomNo, seatData]);

  // iframe postMessage 리스너
  useIframeSeatClick(handleSeatClick);

  // 비로그인 시 리다이렉트
  if (!isAuthenticated) {
    router.replace("/login");
    return null;
  }

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
          <div className="py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                <button
                  onClick={() => router.back()}
                  className="p-2 sm:p-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 group hover:bg-muted/20 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="뒤로 가기"
                >
                  <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-foreground transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                </button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-light text-foreground truncate">
                    {seatData.roomName}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    총 {seatData.totalSeats}석 • 사용 중{" "}
                    {seatData.occupiedSeats.length}석
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 범례 */}
        <div className="py-6">
          <h3 className="text-sm font-light text-foreground mb-6 tracking-wide uppercase">
            좌석 상태
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="flex items-center space-x-3 p-2 rounded-md min-h-[44px]">
              <div className="w-4 h-4 rounded-lg bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-500"></div>
              <span className="text-sm text-foreground font-light">
                이용 가능
              </span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-md min-h-[44px]">
              <div className="w-4 h-4 rounded-lg bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-500"></div>
              <span className="text-sm text-foreground font-light">
                사용 중
              </span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-md min-h-[44px]">
              <div className="w-4 h-4 rounded-lg bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600"></div>
              <span className="text-sm text-foreground font-light">
                사용 불가
              </span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-md min-h-[44px]">
              <div className="w-4 h-4 rounded-lg bg-blue-500 dark:bg-blue-600 border-2 border-blue-600 dark:border-blue-400"></div>
              <span className="text-sm text-foreground font-light">선택됨</span>
            </div>
          </div>
        </div>

        {/* 좌석 배치도 */}
        <div className="py-6">
          <div className="bg-white dark:bg-gray-900 border border-border/20 rounded-lg p-4 sm:p-6 lg:p-8 shadow-sm dark:shadow-gray-900/20">
            <div className="relative">
              <div className="relative overflow-auto border border-border/10 rounded-lg">
                <div className="min-h-[600px] sm:min-h-[800px] lg:min-h-[900px]">
                  <iframe
                    src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/seats/${roomNo}/html`}
                    title={`${seatData.roomName} 좌석 배치도`}
                    className="w-full h-full border-0 rounded-lg"
                    style={{
                      height: "100%",
                      minHeight: "600px",
                      width: "100%",
                      minWidth: "320px",
                    }}
                    scrolling="auto"
                    onError={(e) => {
                      logger.error("Seat layout iframe failed to load:", e);
                    }}
                  />
                </div>
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
        onReserveSeat={reserveSeat}
      />
    </div>
  );
};
