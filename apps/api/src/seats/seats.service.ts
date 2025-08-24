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
  SeatStatusDto,
  MySeatDto,
  ReserveSeatRequestDto,
  SeatActionResponseDto,
  ExtendSeatResponseDto,
} from '@pnu-blace/types';

@Injectable()
export class SeatsService {
  private readonly logger = new Logger(SeatsService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(MyUsageLog)
    private myUsageLogRepository: Repository<MyUsageLog>,
    private schoolApiService: SchoolApiService,
  ) {}

  /**
   * 특정 열람실의 전체 좌석 상태 조회
   */
  async getSeatStatus(roomNo: string): Promise<SeatStatusDto[]> {
    try {
      // 시스템 계정으로 학교 API 로그인
      const loginResult = await this.schoolApiService.loginAsSystem();
      if (!loginResult.success) {
        throw new BadRequestException('좌석 정보 조회에 실패했습니다.');
      }

      // 좌석 현황 조회
      const seats = await this.schoolApiService.getSeatMap(
        roomNo,
        loginResult.sessionID,
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
   * 현재 내가 예약한 좌석 정보 조회
   */
  async getMySeat(studentId: string): Promise<MySeatDto> {
    try {
      // 사용자의 학교 계정으로 로그인 (세션 필요)
      const user = await this.userRepository.findOne({
        where: { studentId },
      });

      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      // TODO: 실제로는 사용자 인증 정보를 저장하고 재사용해야 함
      // 현재는 임시로 시스템 계정 사용
      const loginResult = await this.schoolApiService.loginAsSystem();
      if (!loginResult.success) {
        throw new BadRequestException('좌석 정보 조회에 실패했습니다.');
      }

      const mySeat = await this.schoolApiService.getMySeat(
        studentId,
        loginResult.sessionID!,
      );

      if (!mySeat) {
        throw new NotFoundException('예약한 좌석이 없습니다.');
      }

      return mySeat;
    } catch (error: any) {
      this.logger.error(`Get my seat error: ${error.message}`);

      if (error instanceof NotFoundException) {
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

      // 이미 예약한 좌석이 있는지 확인
      const existingReservation = await this.myUsageLogRepository.findOne({
        where: {
          studentId,
          endTime: null as any, // 아직 반납하지 않은 좌석
        },
      });

      if (existingReservation) {
        throw new ConflictException('이미 예약한 좌석이 있습니다.');
      }

      // 학교 API로 좌석 예약 시도
      const loginResult = await this.schoolApiService.loginAsSystem();
      if (!loginResult.success) {
        throw new BadRequestException('좌석 예약에 실패했습니다.');
      }

      const reserveSuccess = await this.schoolApiService.reserveSeat(
        studentId,
        loginResult.sessionID!,
        roomNo,
        setNo,
      );

      if (!reserveSuccess) {
        throw new BadRequestException('좌석 예약에 실패했습니다.');
      }

      // MyUsageLog에 사용 기록 시작
      const usageLog = this.myUsageLogRepository.create({
        studentId,
        roomNo,
        setNo,
        startTime: new Date(),
        // endTime은 선택적이므로 생략 (기본값 undefined)
      });

      await this.myUsageLogRepository.save(usageLog);

      this.logger.debug(`Seat reserved: ${studentId} - ${roomNo}/${setNo}`);

      return {
        success: true,
        message: '좌석이 성공적으로 예약되었습니다.',
      };
    } catch (error: any) {
      this.logger.error(`Reserve seat error: ${error.message}`);

      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new BadRequestException('좌석 예약 중 오류가 발생했습니다.');
    }
  }

  /**
   * 좌석 반납
   */
  async returnSeat(studentId: string): Promise<SeatActionResponseDto> {
    try {
      // 현재 예약한 좌석 정보 조회
      const currentUsage = await this.myUsageLogRepository.findOne({
        where: {
          studentId,
          endTime: null as any, // 아직 반납하지 않은 좌석
        },
      });

      if (!currentUsage) {
        throw new NotFoundException('예약한 좌석이 없습니다.');
      }

      // 학교 API로 좌석 반납
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

      // MyUsageLog 업데이트 (endTime 설정)
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
   * 좌석 연장
   */
  async extendSeat(studentId: string): Promise<ExtendSeatResponseDto> {
    try {
      // 현재 예약한 좌석 정보 조회
      const currentUsage = await this.myUsageLogRepository.findOne({
        where: {
          studentId,
          endTime: null as any, // 아직 반납하지 않은 좌석
        },
      });

      if (!currentUsage) {
        throw new NotFoundException('예약한 좌석이 없습니다.');
      }

      // 학교 API로 좌석 연장
      const loginResult = await this.schoolApiService.loginAsSystem();
      if (!loginResult.success) {
        throw new BadRequestException('좌석 연장에 실패했습니다.');
      }

      const extendSuccess = await this.schoolApiService.extendSeat(
        studentId,
        loginResult.sessionID!,
        currentUsage.roomNo,
        currentUsage.setNo,
      );

      if (!extendSuccess) {
        throw new BadRequestException('좌석 연장에 실패했습니다.');
      }

      // 연장된 시간 계산 (예: 2시간 연장)
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
}
