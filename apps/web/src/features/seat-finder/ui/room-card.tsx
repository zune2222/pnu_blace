import { RoomInfo } from "@pnu-blace/types";

interface RoomCardProps {
  room: RoomInfo;
  onSelect?: (room: RoomInfo) => void;
}

export const RoomCard = ({ room, onSelect }: RoomCardProps) => {
  const utilizationRate = room.useRate;

  const getUtilizationColor = (rate: number) => {
    if (rate < 30)
      return "bg-green-500/10 text-green-600 dark:bg-green-400/10 dark:text-green-400";
    if (rate < 70)
      return "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-400/10 dark:text-yellow-400";
    return "bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400";
  };

  const getAvailabilityColor = () => {
    if (room.remainSeat === 0)
      return "bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400";
    if (room.remainSeat < 10)
      return "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-400/10 dark:text-yellow-400";
    return "bg-green-500/10 text-green-600 dark:bg-green-400/10 dark:text-green-400";
  };

  const getAvailabilityStatus = () => {
    if (room.remainSeat === 0) return "만석";
    if (room.remainSeat < 10) return "여유석 부족";
    return "여유석 있음";
  };

  return (
    <div
      className="group cursor-pointer py-6 border-b border-border/10 last:border-b-0 hover:bg-muted/5 transition-colors duration-300"
      onClick={() => onSelect?.(room)}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1 min-w-0">
          <h3 className="text-xl font-light text-foreground group-hover:text-muted-foreground transition-colors duration-300">
            {room.roomName}
          </h3>
          <div className="flex items-center space-x-3 flex-wrap">
            <span className="text-sm text-muted-foreground/70 font-light">
              {room.timeStart} - {room.timeEnd}
            </span>
            <span className="text-sm text-muted-foreground/70 font-light">
              {room.totalSeat - room.remainSeat}/{room.totalSeat}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium tracking-wide ${getUtilizationColor(utilizationRate)}`}
            >
              {utilizationRate}%
            </span>
          </div>
        </div>

        <div className="text-right flex items-center space-x-3">
          <div className="w-12 h-1 bg-muted/50 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                utilizationRate < 30
                  ? "bg-green-500"
                  : utilizationRate < 70
                    ? "bg-amber-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${utilizationRate}%` }}
            />
          </div>
          <div
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide ${getAvailabilityColor()}`}
          >
            {getAvailabilityStatus()}
          </div>
        </div>
      </div>
    </div>
  );
};
