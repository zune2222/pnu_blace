import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, MyUsageLog } from '@pnu-blace/db';
import { SchoolApiService } from '../school-api/school-api.service';
import {
  MySeatDto,
  ReserveSeatRequestDto,
  SeatActionResponseDto,
  ExtendSeatResponseDto,
} from '@pnu-blace/types';

@Injectable()
export class SeatReservationService {
  private readonly logger = new Logger(SeatReservationService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(MyUsageLog)
    private myUsageLogRepository: Repository<MyUsageLog>,
    private schoolApiService: SchoolApiService,
  ) {}

  /**
   * 현재 내가 예약한 좌석 정보 조회
   */
  async getMySeat(studentId: string): Promise<MySeatDto> {
    try {
      const user = await this.userRepository.findOne({
        where: { studentId },
      });

      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      if (!user.schoolSessionId) {
        throw new BadRequestException(
          '학교 계정 세션이 없습니다. 다시 로그인해주세요.',
        );
      }

      const mySeat = await this.schoolApiService.getMySeat(
        studentId,
        user.schoolSessionId,
      );

      if (!mySeat) {
        throw new NotFoundException('발권한 좌석이 없습니다.');
      }

      // 추가 정보 조회를 위해 room 정보 가져오기
      const roomInfo = await this.schoolApiService.getRoomInfo(
        mySeat.roomNo,
        user.schoolSessionId,
      );

      // MySeatDto에 추가 정보 포함
      return {
        ...mySeat,
        roomName: roomInfo?.roomName || `열람실 ${mySeat.roomNo}`,
        seatDisplayName: `${mySeat.seatNo}번`,
      };
    } catch (error: any) {
      this.logger.error(`Get my seat error: ${error.message}`);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new BadRequestException(
        '내 좌석 정보 조회 중 오류가 발생했습니다.',
      );
    }
  }

  /**
   * 좌석 예약
   */
  async reserveSeat(
    studentId: string,
    reserveSeatDto: ReserveSeatRequestDto,
  ): Promise<SeatActionResponseDto> {
    try {
      const { roomNo, seatNo } = reserveSeatDto;

      const user = await this.getUserWithValidSession(studentId);

      // 실제 학교 API에서 현재 발권 상태 확인
      try {
        const mySeat = await this.getMySeat(studentId);
        if (mySeat) {
          throw new ConflictException(
            `이미 ${mySeat.roomNo} ${mySeat.seatNo}번 좌석을 발권하고 있습니다. 다른 좌석을 발권하려면 먼저 현재 좌석을 반납해주세요.`,
          );
        }
      } catch (error: any) {
        if (!(error instanceof NotFoundException)) {
          throw error;
        }
      }

      const reserveResult = await this.schoolApiService.reserveSeat(
        studentId,
        user.schoolSessionId!,
        roomNo,
        seatNo,
      );

      if (!reserveResult.success) {
        throw new BadRequestException(
          reserveResult.message || '좌석 발권에 실패했습니다.',
        );
      }

      const usageLog = this.myUsageLogRepository.create({
        studentId,
        roomNo,
        seatNo,
        startTime: new Date(),
      });

      await this.myUsageLogRepository.save(usageLog);

      this.logger.debug(`Seat reserved: ${studentId} - ${roomNo}/${seatNo}`);

      return {
        success: true,
        message: reserveResult.message || '좌석이 성공적으로 발권되었습니다.',
        requiresGateEntry: (reserveResult as any).requiresGateEntry || false,
      };
    } catch (error: any) {
      this.logger.error(`Reserve seat error: ${error.message}`);

      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new BadRequestException('좌석 발권 중 오류가 발생했습니다.');
    }
  }

  /**
   * 좌석 반납
   */
  async returnSeat(studentId: string): Promise<SeatActionResponseDto> {
    try {
      // 학교 API에서 현재 좌석 정보 조회
      const mySeat = await this.getMySeat(studentId);
      if (!mySeat) {
        throw new NotFoundException('예약한 좌석이 없습니다.');
      }

      const user = await this.getUserWithValidSession(studentId);

      const returnResult = await this.schoolApiService.returnSeat(
        studentId,
        user.schoolSessionId!,
        mySeat.roomNo,
        mySeat.seatNo,
      );

      if (!returnResult.success) {
        throw new BadRequestException(
          returnResult.message || '좌석 반납에 실패했습니다.',
        );
      }

      // DB에서 현재 사용 중인 기록 찾아서 종료 시간 업데이트
      const currentUsage = await this.myUsageLogRepository.findOne({
        where: {
          studentId,
          roomNo: mySeat.roomNo,
          seatNo: mySeat.seatNo,
          endTime: null as any,
        },
      });

      if (currentUsage) {
        currentUsage.endTime = new Date();
        await this.myUsageLogRepository.save(currentUsage);
      }

      this.logger.debug(
        `Seat returned: ${studentId} - ${mySeat.roomNo}/${mySeat.seatNo}`,
      );

      return {
        success: true,
        message: '좌석이 성공적으로 반납되었습니다.',
      };
    } catch (error: any) {
      this.logger.error(`Return seat error: ${error.message}`);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new BadRequestException('좌석 반납 중 오류가 발생했습니다.');
    }
  }

  /**
   * 좌석 연장
   */
  async extendSeat(studentId: string): Promise<ExtendSeatResponseDto> {
    try {
      // 학교 API에서 현재 좌석 정보 조회
      const mySeat = await this.getMySeat(studentId);
      if (!mySeat) {
        throw new NotFoundException('예약한 좌석이 없습니다.');
      }

      const user = await this.getUserWithValidSession(studentId);

      const extendResult = await this.schoolApiService.extendSeat(
        studentId,
        user.schoolSessionId!,
        mySeat.roomNo,
        mySeat.seatNo,
      );

      if (!extendResult.success) {
        throw new BadRequestException(
          extendResult.message || '좌석 연장에 실패했습니다.',
        );
      }

      // 연장 후 새로운 종료 시간 계산 (2시간 추가)
      const extendedEndTime = new Date();
      extendedEndTime.setHours(extendedEndTime.getHours() + 2);

      this.logger.debug(
        `Seat extended: ${studentId} - ${mySeat.roomNo}/${mySeat.seatNo}`,
      );

      return {
        success: true,
        endTime: extendedEndTime.toISOString(),
        message: extendResult.message || '좌석이 성공적으로 연장되었습니다.',
      };
    } catch (error: any) {
      this.logger.error(`Extend seat error: ${error.message}`);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new BadRequestException('좌석 연장 중 오류가 발생했습니다.');
    }
  }

  /**
   * 사용자 정보 조회 및 세션 유효성 검증
   */
  private async getUserWithValidSession(studentId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { studentId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
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
