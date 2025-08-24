import { Injectable, Logger } from '@nestjs/common';
import { SchoolApiService } from '../school-api/school-api.service';
import { RoomInfo } from '@pnu-blace/types';

@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);

  constructor(private readonly schoolApiService: SchoolApiService) {}

  /**
   * 모든 열람실 현황 조회
   */
  async getRoomStatus(): Promise<RoomInfo[]> {
    try {
      this.logger.debug('Fetching room status from school API');
      const rooms = await this.schoolApiService.getRoomStatus();
      this.logger.debug(`Retrieved ${rooms.length} rooms`);
      return rooms;
    } catch (error: any) {
      this.logger.error(`Failed to get room status: ${error.message}`);
      throw new Error('열람실 정보를 가져오는데 실패했습니다.');
    }
  }
}
