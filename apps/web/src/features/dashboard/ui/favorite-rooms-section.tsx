"use client";
import React from "react";
import { Button } from "@/shared/ui";

interface ReadingRoom {
  id: string;
  name: string;
  totalSeats: number;
  occupiedSeats: number;
  occupancyRate: number;
  isFavorite: boolean;
}

export const FavoriteRoomsSection: React.FC = () => {
  // TODO: 실제 데이터는 API나 상태 관리에서 가져와야 함
  const favoriteRooms: ReadingRoom[] = [
    {
      id: "1",
      name: "2F 새벽별당-A",
      totalSeats: 120,
      occupiedSeats: 90,
      occupancyRate: 75,
      isFavorite: true
    },
    {
      id: "2", 
      name: "4F 제3열람실-A",
      totalSeats: 80,
      occupiedSeats: 32,
      occupancyRate: 40,
      isFavorite: true
    },
    {
      id: "3",
      name: "1F 제1열람실",
      totalSeats: 100,
      occupiedSeats: 85,
      occupancyRate: 85,
      isFavorite: true
    }
  ];

  const getOccupancyColor = (rate: number) => {
    if (rate < 50) return "bg-green-500";
    if (rate < 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getOccupancyText = (rate: number) => {
    if (rate < 50) return "여유";
    if (rate < 75) return "보통";
    return "혼잡";
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">즐겨찾는 열람실</h2>
        <Button variant="outline" size="sm">
          전체보기
        </Button>
      </div>

      <div className="space-y-4">
        {favoriteRooms.map((room) => (
          <div
            key={room.id}
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-500">⭐</span>
                <h3 className="font-medium text-foreground">{room.name}</h3>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  {room.occupiedSeats}/{room.totalSeats}석
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getOccupancyColor(room.occupancyRate)}`}
                      style={{ width: `${room.occupancyRate}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    room.occupancyRate < 50 
                      ? "bg-green-100 text-green-700" 
                      : room.occupancyRate < 75 
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}>
                    {getOccupancyText(room.occupancyRate)}
                  </span>
                </div>
              </div>

              <Button variant="outline" size="sm">
                좌석보기
              </Button>
            </div>
          </div>
        ))}
      </div>

      {favoriteRooms.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">즐겨찾는 열람실이 없습니다</h3>
          <p className="text-muted-foreground mb-4">자주 이용하는 열람실을 즐겨찾기에 추가해보세요</p>
          <Button>열람실 둘러보기</Button>
        </div>
      )}
    </div>
  );
};