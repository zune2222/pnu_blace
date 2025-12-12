"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  SeatDetailDto,
  ReserveSeatRequestDto,
  SeatActionResponseDto,
} from "@pnu-blace/types";
import { apiClient } from "@/lib/api";
import { SeatSelectionModal } from "./ui";
import React from "react";
import { toast } from "sonner";
import { useAuth } from "@/entities/auth";
import { logger } from "@/shared/lib/logger";
import { 
  getSeatReservationErrorMessage, 
  isExpectedApiError 
} from "@/shared/lib/error-utils";

interface SeatDetailPageProps {
  roomNo: string;
}

export const SeatDetailPage = ({ roomNo }: SeatDetailPageProps) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [, setIsReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seatData, setSeatData] = useState<SeatDetailDto | null>(null);

  const handleSeatClick = useCallback((seatNo: string) => {
    setSelectedSeat(seatNo);
    setIsModalOpen(true);
  }, []);

  // 비로그인 시 상세 페이지 접근 시도 시 로그인으로 이동
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchSeatData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 인증 필요한 API: 미인증 시 ApiClient가 로그인으로 리다이렉트
        const data = await apiClient.get<SeatDetailDto>(
          `/api/v1/seats/${roomNo}/detail`
        );
        setSeatData(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : '좌석 정보를 불러오는데 실패했습니다.';
        logger.error("Error fetching seat data:", err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeatData();
  }, [roomNo, isAuthenticated]);

  // iframe으로부터 메시지 받기
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "SEAT_CLICK") {
        const seatNo = event.data.seatNo;
        handleSeatClick(seatNo);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleSeatClick]);

  const handleReserveSeat = async (
    seatNo: string,
    autoExtensionEnabled?: boolean
  ) => {
    try {
      setIsReserving(true);

      const reserveRequest: ReserveSeatRequestDto = {
        roomNo,
        seatNo: seatNo,
        autoExtensionEnabled,
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

        // 성공 메시지 표시
        if (response.requiresGateEntry) {
          toast.success("좌석이 성공적으로 발권되었습니다!", {
            description: "15분 이내에 출입게이트를 통과해주세요.",
            duration: 5000,
          });
        } else {
          toast.success(
            response.message || "좌석이 성공적으로 발권되었습니다!"
          );
        }
      }
    } catch (err: unknown) {
      const errorMessage = getSeatReservationErrorMessage(err);
      
      // 예상치 못한 에러만 로그에 출력
      if (!isExpectedApiError(err)) {
        logger.error("Unexpected reservation error:", err);
      }

      toast.error("좌석 발권 실패", {
        description: errorMessage,
        duration: 4000,
      });
      throw err;
    } finally {
      setIsReserving(false);
    }
  };

  // TODO: 네이티브 UI로 좌석 렌더링 구현 시 getSeatStatus, getSeatClassName 복원 필요

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

  if (!isAuthenticated) {
    return null;
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

        {/* 에러 메시지 - 좌석 데이터 로딩 실패 시에만 표시 */}
        {error && !seatData && (
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

        {/* 좌석 배치도 - 부산대학교 실제 구조 반영 */}
        <div className="py-6">
          <div className="bg-white dark:bg-gray-900 border border-border/20 rounded-lg p-4 sm:p-6 lg:p-8 shadow-sm dark:shadow-gray-900/20">
            <div className="relative">
              {/* 좌석 배치도 컨테이너 */}
              <div className="relative overflow-auto border border-border/10 rounded-lg">
                <div className="min-h-[600px] sm:min-h-[800px] lg:min-h-[900px]">
                  {/* 백엔드에서 제공하는 HTML을 iframe으로 표시 (배경 이미지 포함) */}
                  <iframe
                    src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/seats/${roomNo}/html`}
                    title={`${seatData?.roomName || "열람실"} 좌석 배치도`}
                    className="w-full h-full border-0 rounded-lg"
                    style={{
                      height: "100%",
                      minHeight: "600px",
                      width: "100%",
                      minWidth: "320px", // 모바일 최소 너비
                    }}
                    scrolling="auto"
                    onLoad={() => {}}
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
      />
    </div>
  );
};
