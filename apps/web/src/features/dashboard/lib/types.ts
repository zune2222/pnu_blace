export interface SeatInfo {
  roomName: string;
  seatDisplayName: string;
}

export type SeatHandlerFunction = () => Promise<void>;