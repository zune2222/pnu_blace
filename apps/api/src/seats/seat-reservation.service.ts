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

      return mySeat;
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
      const { roomNo, setNo } = reserveSeatDto;

      const user = await this.getUserWithValidSession(studentId);

      // 실제 학교 API에서 현재 발권 상태 확인
      try {
        const mySeat = await this.getMySeat(studentId);
        if (mySeat) {
          throw new ConflictException(
            `이미 ${mySeat.roomNo} ${mySeat.setNo}번 좌석을 발권하고 있습니다. 다른 좌석을 발권하려면 먼저 현재 좌석을 반납해주세요.`,
          );
        }
      } catch (error: any) {
        if (!(error instanceof NotFoundException)) {
          throw error;
        }
      }

      const reserveSuccess = await this.schoolApiService.reserveSeat(
        studentId,
        user.schoolSessionId!,
        roomNo,
        setNo,
      );

      if (!reserveSuccess) {
        throw new BadRequestException('좌석 발권에 실패했습니다.');
      }

      const usageLog = this.myUsageLogRepository.create({
        studentId,
        roomNo,
        setNo,
        startTime: new Date(),
      });

      await this.myUsageLogRepository.save(usageLog);

      this.logger.debug(`Seat reserved: ${studentId} - ${roomNo}/${setNo}`);

      return {
        success: true,
        message: '좌석이 성공적으로 발권되었습니다.',
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
      const currentUsage = await this.myUsageLogRepository.findOne({
        where: {
          studentId,
          endTime: null as any,
        },
      });

      if (!currentUsage) {
        throw new NotFoundException('예약한 좌석이 없습니다.');
      }

      const loginResult = await this.schoolApiService.loginAsSystem();
      if (!loginResult.success) {
        throw new BadRequestException('좌석 반납에 실패했습니다.');
      }

      const returnSuccess = await this.schoolApiService.returnSeat(
        studentId,
        loginResult.sessionID!,
        currentUsage.roomNo,
        currentUsage.setNo,
      );

      if (!returnSuccess) {
        throw new BadRequestException('좌석 반납에 실패했습니다.');
      }

      currentUsage.endTime = new Date();
      await this.myUsageLogRepository.save(currentUsage);

      this.logger.debug(
        `Seat returned: ${studentId} - ${currentUsage.roomNo}/${currentUsage.setNo}`,
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
   * 빈자리 예약 (현재 사용 중인 좌석이 비워지면 자동 예약)
   */
  async reserveEmptySeat(
    studentId: string,
    reserveSeatDto: ReserveSeatRequestDto,
  ): Promise<SeatActionResponseDto> {
    try {
      const { roomNo, setNo } = reserveSeatDto;

      const existingReservation = await this.myUsageLogRepository.findOne({
        where: {
          studentId,
          endTime: null as any,
        },
      });

      if (existingReservation) {
        throw new ConflictException('이미 예약한 좌석이 있습니다.');
      }

      // 현재 좌석이 실제로 사용 중인지 확인하기 위해 직접 좌석 정보를 가져옴
      const user = await this.getUserWithValidSession(studentId);
      const seats = await this.schoolApiService.getSeatMap(roomNo, user.schoolSessionId!);
      const targetSeat = seats.find((seat) => seat.setNo === setNo);

      if (!targetSeat) {
        throw new BadRequestException('좌석을 찾을 수 없습니다.');
      }

      if (targetSeat.status !== 'OCCUPIED') {
        throw new BadRequestException('이 좌석은 현재 사용 중이 아닙니다.');
      }

      // TODO: 실제로는 NotificationRequest 엔티티에 빈자리 예약 요청을 저장
      this.logger.debug(
        `Empty seat reservation requested: ${studentId} - ${roomNo}/${setNo}`,
      );

      return {
        success: true,
        message:
          '빈자리 예약이 완료되었습니다. 좌석이 비워지면 자동으로 예약됩니다.',
      };
    } catch (error: any) {
      this.logger.error(`Reserve empty seat error: ${error.message}`);

      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new BadRequestException('빈자리 예약 중 오류가 발생했습니다.');
    }
  }

  /**
   * 좌석 연장
   */
  async extendSeat(studentId: string): Promise<ExtendSeatResponseDto> {
    try {
      const currentUsage = await this.myUsageLogRepository.findOne({
        where: {
          studentId,
          endTime: null as any,
        },
      });

      if (!currentUsage) {
        throw new NotFoundException('예약한 좌석이 없습니다.');
      }

      const user = await this.getUserWithValidSession(studentId);

      const extendSuccess = await this.schoolApiService.extendSeat(
        studentId,
        user.schoolSessionId!,
        currentUsage.roomNo,
        currentUsage.setNo,
      );

      if (!extendSuccess) {
        throw new BadRequestException('좌석 연장에 실패했습니다.');
      }

      const extendedEndTime = new Date();
      extendedEndTime.setHours(extendedEndTime.getHours() + 2);

      this.logger.debug(
        `Seat extended: ${studentId} - ${currentUsage.roomNo}/${currentUsage.setNo}`,
      );

      return {
        success: true,
        endTime: extendedEndTime.toISOString(),
        message: '좌석이 성공적으로 연장되었습니다.',
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