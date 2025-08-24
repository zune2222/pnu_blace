import { RoomCardProps } from "@/entities/room";
import {
  RoomHeader,
  RoomInfoRow,
  RoomStatusIndicator,
} from "@/features/seat-finder/ui";

export const RoomCard = ({ room, onSelect }: RoomCardProps) => {
  return (
    <div
      className="group cursor-pointer py-6 border-b border-border/10 last:border-b-0 hover:bg-muted/5 transition-colors duration-300"
      onClick={() => onSelect?.(room)}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1 min-w-0">
          <RoomHeader roomName={room.roomName} />
          <RoomInfoRow
            timeStart={room.timeStart}
            timeEnd={room.timeEnd}
            totalSeats={room.totalSeat}
            usedSeats={room.totalSeat - room.remainSeat}
            utilizationRate={room.useRate}
          />
        </div>
        <RoomStatusIndicator
          utilizationRate={room.useRate}
          remainingSeats={room.remainSeat}
        />
      </div>
    </div>
  );
};
