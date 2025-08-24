"use client";
import React from "react";
import Link from "next/link";

interface CurrentSeatData {
  isReserved: boolean;
  roomName?: string;
  seatNumber?: string;
  timeRemaining?: string;
  lastUsedRoom?: string;
}

export const CurrentSeatWidget: React.FC = () => {
  // TODO: 실제 데이터는 API나 상태 관리에서 가져와야 함
  const seatData: CurrentSeatData = {
    isReserved: true,
    roomName: "2F 새벽별당-A",
    seatNumber: "78번",
    timeRemaining: "3:15:20",
    lastUsedRoom: "4F 제3열람실-A"
  };

  return (
    <section className="py-20 md:py-32">
      <div className="max-w-4xl mx-auto">
        {seatData.isReserved ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* 왼쪽: 좌석 정보 */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs px-2 py-1 bg-green-500/10 text-green-600 dark:bg-green-400/10 dark:text-green-400 rounded-full font-medium tracking-wide">
                    ACTIVE
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-extralight text-foreground leading-tight">
                  내 좌석
                </h1>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-extralight text-foreground mb-2">
                    {seatData.roomName}
                  </h2>
                  <p className="text-xl text-muted-foreground/70 font-light">
                    {seatData.seatNumber}
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
                
                <Link
                  href="#"
                  className="text-base text-muted-foreground/50 font-light hover:text-muted-foreground transition-colors duration-300"
                >
                  반납
                </Link>
              </div>
            </div>

            {/* 오른쪽: 시간 정보 */}
            <div className="text-center lg:text-right space-y-6">
              <div>
                <p className="text-sm text-muted-foreground/60 font-light mb-4 tracking-wide uppercase">
                  Time Remaining
                </p>
                <div className="font-mono text-6xl md:text-7xl font-extralight text-foreground leading-none">
                  {seatData.timeRemaining}
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
                <span>{seatData.lastUsedRoom ? `${seatData.lastUsedRoom}로 이동` : "좌석 찾기"}</span>
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