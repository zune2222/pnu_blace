"use client";

import { useRouter } from "next/navigation";
import { RoomInfo } from "@pnu-blace/types";
import { useRooms } from "@/entities/room";
import { RoomList } from "./ui/room-list";

export const SeatFinderPage = () => {
  const router = useRouter();
  const { data: rooms, isLoading, error } = useRooms();

  const handleRoomSelect = (room: RoomInfo) => {
    // 선택한 열람실의 좌석 상세 페이지로 이동
    router.push(`/seats/${room.roomNo}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">좌석 찾기</h1>
          <p className="text-gray-600">원하는 열람실을 선택하여 좌석을 예약하세요</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">열람실 현황</h2>
            <div className="text-sm text-gray-500">
              {rooms && `총 ${rooms.length}개 열람실`}
            </div>
          </div>
          
          {/* 범례 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">이용률 기준</h3>
            <div className="flex space-x-6 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-green-100"></div>
                <span className="text-green-600">여유 (30% 미만)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-yellow-100"></div>
                <span className="text-yellow-600">보통 (30-70%)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-red-100"></div>
                <span className="text-red-600">혼잡 (70% 이상)</span>
              </div>
            </div>
          </div>
        </div>

        <RoomList 
          rooms={rooms || []}
          isLoading={isLoading}
          error={error}
          onRoomSelect={handleRoomSelect}
        />
      </div>
    </div>
  );
};