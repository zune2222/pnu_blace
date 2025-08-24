import { RoomInfo } from "@pnu-blace/types";

interface RoomCardProps {
  room: RoomInfo;
  onSelect?: (room: RoomInfo) => void;
}

export const RoomCard = ({ room, onSelect }: RoomCardProps) => {
  const utilizationRate = room.useRate;
  
  const getUtilizationColor = (rate: number) => {
    if (rate < 30) return "bg-green-500/10 text-green-600 dark:bg-green-400/10 dark:text-green-400";
    if (rate < 70) return "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-400/10 dark:text-yellow-400";
    return "bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400";
  };

  const getAvailabilityColor = () => {
    if (room.remainSeat === 0) return "bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400";
    if (room.remainSeat < 10) return "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-400/10 dark:text-yellow-400";
    return "bg-green-500/10 text-green-600 dark:bg-green-400/10 dark:text-green-400";
  };

  const getAvailabilityStatus = () => {
    if (room.remainSeat === 0) return "만석";
    if (room.remainSeat < 10) return "여유석 부족";
    return "여유석 있음";
  };

  return (
    <div 
      className="group bg-background border border-border rounded-lg p-6 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300 cursor-pointer hover:border-border/60"
      onClick={() => onSelect?.(room)}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-2">
          <h3 className="text-xl font-extralight text-foreground group-hover:text-muted-foreground transition-colors duration-300">
            {room.roomName}
          </h3>
          <p className="text-sm text-muted-foreground/70 font-light">
            {room.timeStart} - {room.timeEnd}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide ${getUtilizationColor(utilizationRate)}`}>
          {utilizationRate}%
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex space-x-6 text-sm font-light">
          <span className="text-muted-foreground/70">
            전체 <span className="font-medium text-foreground ml-1">{room.totalSeat}</span>
          </span>
          <span className="text-muted-foreground/70">
            사용중 <span className="font-medium text-foreground ml-1">{room.useSeat}</span>
          </span>
          <span className="text-muted-foreground/70">
            잔여 <span className="font-medium text-foreground ml-1">{room.remainSeat}</span>
          </span>
        </div>
        <div className={`text-xs px-3 py-1 rounded-full font-medium tracking-wide ${getAvailabilityColor()}`}>
          {getAvailabilityStatus()}
        </div>
      </div>
    </div>
  );
};