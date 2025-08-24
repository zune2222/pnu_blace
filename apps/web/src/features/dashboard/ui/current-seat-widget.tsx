"use client";
import React from "react";
import Link from "next/link";
import { CurrentSeat } from "@/entities/dashboard";

// 남은 시간을 포맷하는 유틸 함수
const formatRemainingTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const secs = 0; // API에서 초 단위는 제공되지 않으므로 0으로 설정
  return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 좌석 상태 배지 (현재 좌석이 있으면 ACTIVE)
const getStatusBadge = () => {
  return {
    color: 'green',
    text: 'ACTIVE',
    bgClass: 'bg-green-500/10 text-green-600 dark:bg-green-400/10 dark:text-green-400'
  };
};

interface CurrentSeatWidgetProps {
  currentSeat: CurrentSeat | null;
  isLoading: boolean;
  error: string | null;
  cancelReservation: (reservationId: string) => Promise<void>;
}

export const CurrentSeatWidget: React.FC<CurrentSeatWidgetProps> = ({
  currentSeat,
  isLoading,
  error,
  cancelReservation: cancelReservationProp
}) => {
  // 좌석 취소 핸들러
  const handleCancelReservation = async () => {
    if (!currentSeat?.reservationId) return;
    
    try {
      await cancelReservationProp(currentSeat.reservationId);
    } catch (err) {
      console.error('예약 취소 실패:', err);
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <section className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-2xl text-muted-foreground font-light">좌석 정보를 불러오는 중...</div>
        </div>
      </section>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <section className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xl text-red-600 font-light">{error}</div>
        </div>
      </section>
    );
  }

  const isReserved = currentSeat !== null;
  const statusBadge = isReserved ? getStatusBadge() : null;

  return (
    <section className="py-20 md:py-32">
      <div className="max-w-4xl mx-auto">
        {isReserved ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* 왼쪽: 좌석 정보 */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 bg-${statusBadge?.color}-500 rounded-full animate-pulse`}></div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium tracking-wide ${statusBadge?.bgClass}`}>
                    {statusBadge?.text}
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-extralight text-foreground leading-tight">
                  내 좌석
                </h1>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-extralight text-foreground mb-2">
                    {currentSeat?.roomName}
                  </h2>
                  <p className="text-xl text-muted-foreground/70 font-light">
                    {currentSeat?.seatDisplayName}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 pt-4">
                <Link
                  href="#"
                  className="group inline-flex items-center space-x-3 text-lg font-light text-foreground hover:text-muted-foreground transition-colors duration-300"
                >
                  <span>시간 연장</span>
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                
                <button
                  onClick={handleCancelReservation}
                  className="text-base text-muted-foreground/50 font-light hover:text-muted-foreground transition-colors duration-300"
                >
                  반납
                </button>
              </div>
            </div>

            {/* 오른쪽: 시간 정보 */}
            <div className="text-center lg:text-right space-y-6">
              <div>
                <p className="text-sm text-muted-foreground/60 font-light mb-4 tracking-wide uppercase">
                  Time Remaining
                </p>
                <div className="font-mono text-6xl md:text-7xl font-extralight text-foreground leading-none">
                  {currentSeat?.remainingMinutes ? formatRemainingTime(currentSeat.remainingMinutes) : '0:00:00'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-12">
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-extralight text-foreground leading-tight">
                내 좌석
              </h1>
              
              <div className="space-y-6">
                <h3 className="text-2xl md:text-3xl font-extralight text-foreground">
                  예약한 좌석이 없습니다
                </h3>
                <p className="text-lg text-muted-foreground/70 font-light leading-relaxed max-w-2xl mx-auto">
                  새로운 학습 공간을 찾아보세요
                </p>
              </div>
            </div>
            
            <div>
              <Link
                href="#"
                className="group inline-flex items-center space-x-4 text-xl font-light text-foreground hover:text-muted-foreground transition-colors duration-300"
              >
                <span>좌석 찾기</span>
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};