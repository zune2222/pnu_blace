"use client";
import React from "react";
import { Button } from "@/shared/ui";

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
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">내 좌석</h2>
        {seatData.isReserved && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-600 font-medium">이용 중</span>
          </div>
        )}
      </div>

      {seatData.isReserved ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-foreground">
                {seatData.roomName} · {seatData.seatNumber}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                남은 시간: <span className="font-mono text-foreground">{seatData.timeRemaining}</span>
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="primary" 
              size="sm"
              className="flex-1"
            >
              시간 연장
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1"
            >
              좌석 반납
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">현재 예약한 좌석이 없습니다</h3>
            <p className="text-muted-foreground mb-6">바로 좌석을 예약해보세요!</p>
            
            <Button className="w-full max-w-xs">
              {seatData.lastUsedRoom ? `${seatData.lastUsedRoom}로 이동` : "좌석 찾기"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};