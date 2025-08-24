import { Controller, Get } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomInfo } from '@pnu-blace/types';

@Controller('api/v1/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  /**
   * 모든 열람실 현황 조회
   */
  @Get()
  async getRoomStatus(): Promise<RoomInfo[]> {
    return this.roomsService.getRoomStatus();
  }
}
