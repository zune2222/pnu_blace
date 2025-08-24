"use client";

import { RoomInfo } from "@pnu-blace/types";
import { RoomCard } from "./room-card";

interface RoomListProps {
  rooms: RoomInfo[];
  isLoading?: boolean;
  error?: Error | null;
  onRoomSelect?: (room: RoomInfo) => void;
}

export const RoomList = ({
  rooms,
  isLoading,
  error,
  onRoomSelect,
}: RoomListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-muted/20 rounded-lg h-32 border border-border/10"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="text-lg text-red-600 dark:text-red-400 font-light">
          열람실 정보를 불러올 수 없습니다
        </div>
        <div className="text-sm text-muted-foreground/60 font-light">
          {error.message}
        </div>
      </div>
    );
  }

  if (!rooms || rooms.length === 0) {
    return (
      <div className="text-center py-12 space-y-6">
        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-light text-foreground">
            현재 이용 가능한 열람실이 없습니다
          </h3>
          <p className="text-base md:text-lg text-muted-foreground font-light leading-relaxed max-w-md mx-auto">
            잠시 후 다시 시도해보세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {rooms.map((room) => (
        <RoomCard key={room.roomNo} room={room} onSelect={onRoomSelect} />
      ))}
    </div>
  );
};
