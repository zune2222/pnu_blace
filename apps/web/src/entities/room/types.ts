// RoomCard 관련 타입들
export interface RoomCardProps {
  room: RoomInfo;
  onSelect?: (room: RoomInfo) => void;
}

export interface RoomHeaderProps {
  roomName: string;
}

export interface RoomInfoRowProps {
  timeStart: string;
  timeEnd: string;
  totalSeats: number;
  usedSeats: number;
  utilizationRate: number;
}

export interface UtilizationBadgeProps {
  rate: number;
}

export interface RoomStatusIndicatorProps {
  utilizationRate: number;
  remainingSeats: number;
}

export interface ProgressBarProps {
  rate: number;
}

export interface AvailabilityBadgeProps {
  remainingSeats: number;
}

// RoomList 관련 타입들
export interface RoomListProps {
  rooms: RoomInfo[];
  isLoading?: boolean;
  error?: Error | null;
  onRoomSelect?: (room: RoomInfo) => void;
}

export interface LoadingSkeletonProps {
  count?: number;
}

export interface ErrorMessageProps {
  message: string;
}

export interface RoomListContentProps {
  rooms: RoomInfo[];
  onRoomSelect?: (room: RoomInfo) => void;
}

// RoomInfo 타입 (기존 types 패키지에서 가져옴)
export interface RoomInfo {
  roomNo: string;
  roomName: string;
  timeStart: string;
  timeEnd: string;
  totalSeat: number;
  useSeat: number;
  remainSeat: number;
  useRate: number;
}
