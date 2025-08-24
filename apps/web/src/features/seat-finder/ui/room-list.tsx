"use client";

import { RoomListProps } from "@/entities/room";
import {
  LoadingSkeleton,
  ErrorMessage,
  EmptyState,
  RoomListContent,
} from "@/features/seat-finder/ui";

export const RoomList = ({
  rooms,
  isLoading,
  error,
  onRoomSelect,
}: RoomListProps) => {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  if (!rooms || rooms.length === 0) {
    return <EmptyState />;
  }

  return <RoomListContent rooms={rooms} onRoomSelect={onRoomSelect} />;
};
