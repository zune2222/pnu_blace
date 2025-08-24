"use client";

import { RoomInfo } from "@pnu-blace/types";
import { RoomCard } from "./room-card";

interface RoomListProps {
  rooms: RoomInfo[];
  isLoading?: boolean;
  error?: Error | null;
  onRoomSelect?: (room: RoomInfo) => void;
}

export const RoomList = ({ rooms, isLoading, error, onRoomSelect }: RoomListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-24"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">열람실 정보를 불러올 수 없습니다</div>
        <div className="text-sm text-gray-500">{error.message}</div>
      </div>
    );
  }

  if (!rooms || rooms.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        현재 이용 가능한 열람실이 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rooms.map((room) => (
        <RoomCard 
          key={room.roomNo} 
          room={room} 
          onSelect={onRoomSelect}
        />
      ))}
    </div>
  );
};