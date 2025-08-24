import { RoomListContentProps } from "@/entities/room";
import { RoomCard } from "@/features/seat-finder/ui";

export const RoomListContent = ({
  rooms,
  onRoomSelect,
}: RoomListContentProps) => {
  return (
    <div className="space-y-6">
      {rooms.map((room) => (
        <RoomCard key={room.roomNo} room={room} onSelect={onRoomSelect} />
      ))}
    </div>
  );
};
