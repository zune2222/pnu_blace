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
    <section className="py-16 md:py-20 lg:pr-12">
      <div className="space-y-12">
        {/* 섹션 헤더 */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-extralight text-foreground">
            즐겨찾는 열람실
          </h2>
          <p className="text-sm text-muted-foreground/60 font-light tracking-wide uppercase">
            Favorites
          </p>
        </div>

        {/* 열람실 목록 */}
        <div className="space-y-8">
          {favoriteRooms.map((room, index) => (
            <div key={room.id} className="group cursor-pointer py-4 border-b border-border/10 last:border-b-0">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-light text-foreground group-hover:text-muted-foreground transition-colors duration-300">
                    {room.name}
                  </h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground/70 font-light">
                      {room.occupiedSeats}/{room.totalSeats}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium tracking-wide ${
                      room.occupancyRate < 50 
                        ? "bg-green-500/10 text-green-600 dark:bg-green-400/10 dark:text-green-400" 
                        : room.occupancyRate < 75 
                          ? "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400"
                          : "bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400"
                    }`}>
                      {getOccupancyText(room.occupancyRate)}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="w-16 h-1 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        room.occupancyRate < 50 
                          ? "bg-green-500" 
                          : room.occupancyRate < 75 
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${room.occupancyRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {favoriteRooms.length === 0 && (
          <div className="text-center py-12 space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl md:text-2xl font-light text-foreground">
                즐겨찾는 열람실이 없습니다
              </h3>
              <p className="text-base md:text-lg text-muted-foreground font-light leading-relaxed max-w-md mx-auto">
                자주 이용하는 열람실을 즐겨찾기에 추가해보세요
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};