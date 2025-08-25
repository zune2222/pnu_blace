import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@pnu-blace/db';
import { SchoolApiService } from '../school-api/school-api.service';
import { SeatStatusDto, SeatDetailDto } from '@pnu-blace/types';

@Injectable()
export class SeatQueryService {
  private readonly logger = new Logger(SeatQueryService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private schoolApiService: SchoolApiService,
  ) {}

  /**
   * 특정 열람실의 전체 좌석 상태 조회
   */
  async getSeatStatus(
    roomNo: string,
    studentId: string,
  ): Promise<SeatStatusDto[]> {
    try {
      const user = await this.getUserWithValidSession(studentId);
      
      const seats = await this.schoolApiService.getSeatMap(
        roomNo,
        user.schoolSessionId!,
      );

      return seats.map((seat) => ({
        setNo: seat.setNo,
        status: seat.status,
      }));
    } catch (error: any) {
      this.logger.error(`Get seat status error: ${error.message}`);
      throw new BadRequestException('좌석 정보 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 특정 열람실의 상세 좌석 정보 조회
   */
  async getSeatDetail(
    roomNo: string,
    studentId: string,
  ): Promise<SeatDetailDto> {
    try {
      const user = await this.getUserWithValidSession(studentId);

      const seats = await this.schoolApiService.getSeatMap(
        roomNo,
        user.schoolSessionId!,
      );

      const roomInfo = await this.schoolApiService.getRoomInfo(
        roomNo,
        user.schoolSessionId!,
      );

      const occupiedSeats = seats
        .filter((seat) => seat.status === 'OCCUPIED')
        .map((seat) => seat.setNo);

      const unavailableSeats = seats
        .filter((seat) => seat.status === 'UNAVAILABLE')
        .map((seat) => seat.setNo);

      const availableSeats = seats
        .filter((seat) => seat.status === 'AVAILABLE')
        .map((seat) => seat.setNo);

      return {
        roomNo: roomInfo?.roomNo || roomNo,
        roomName: roomInfo?.roomName || `열람실 ${roomNo}`,
        totalSeats: seats.length,
        occupiedSeats,
        unavailableSeats,
        availableSeats,
        seats: seats.map((seat) => ({
          setNo: seat.setNo,
          status: seat.status,
        })),
        backgroundImageUrl: this.schoolApiService.getBackgroundImageUrl(roomNo),
      };
    } catch (error: any) {
      this.logger.error(`Get seat detail error: ${error.message}`);
      throw new BadRequestException(
        '좌석 상세 정보 조회 중 오류가 발생했습니다.',
      );
    }
  }

  /**
   * 방 번호에 따른 배경 이미지 URL 반환
   */
  getBackgroundImageUrl(roomNo: string): string {
    return this.schoolApiService.getBackgroundImageUrl(roomNo);
  }

  /**
   * 사용자 정보 조회 및 세션 유효성 검증
   */
  private async getUserWithValidSession(studentId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { studentId },
    });

    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    const now = new Date();
    if (
      !user.schoolSessionId ||
      !user.schoolSessionExpiresAt ||
      user.schoolSessionExpiresAt < now
    ) {
      throw new BadRequestException(
        '학교 계정 세션이 만료되었습니다. 다시 로그인해주세요.',
      );
    }

    return user;
  }
}