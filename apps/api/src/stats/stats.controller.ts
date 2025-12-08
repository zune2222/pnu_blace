import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { StatsService } from './stats.service';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  MyUsageStatsDto,
  SeatPredictionDto,
  CreateAcademicCalendarDto,
  CalendarActionResponseDto,
} from '@pnu-blace/types';

@Controller('api/v1/stats')
export class StatsController {
  constructor(
    private readonly statsService: StatsService,
    private readonly calendarService: CalendarService,
  ) {}

  /**
   * 개인 이용 통계 조회
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyStats(@Request() req): Promise<MyUsageStatsDto> {
    const user = req.user;
    return this.statsService.getMyUsageStats(user.studentId);
  }

  /**
   * 자리 이용 내역 조회 (학교 API)
   */
  @Get('seat-history')
  @UseGuards(JwtAuthGuard)
  async getMySeatHistory(@Request() req) {
    const user = req.user;
    return this.statsService.getMySeatHistory(user.studentId, user.sessionID);
  }

  /**
   * 전체 랭킹 조회
   */
  @Get('rankings/all-time')
  async getAllTimeRankings(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 20, 100); // 최대 100개
    return this.statsService.getAllTimeRankings(limitNum, pageNum);
  }

  /**
   * 이번주 랭킹 조회
   */
  @Get('rankings/weekly')
  async getWeeklyRankings(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 20, 100); // 최대 100개
    return this.statsService.getWeeklyRankings(limitNum, pageNum);
  }

  /**
   * 내 랭킹 정보 조회
   */
  @Get('my-rank')
  @UseGuards(JwtAuthGuard)
  async getMyRankInfo(@Request() req) {
    const user = req.user;
    return this.statsService.getUserRankInfo(user.studentId);
  }

  /**
   * 랭킹 닉네임 변경
   */
  @Post('ranking-privacy')
  @UseGuards(JwtAuthGuard)
  async updateRankingNickname(
    @Request() req,
    @Body() body: { nickname?: string },
  ) {
    const user = req.user;
    return this.statsService.updateRankingPrivacy(
      user.studentId,
      true, // 항상 공개 (자동 참여)
      body.nickname,
    );
  }

  /**
   * 랭킹 설정 조회 (닉네임)
   */
  @Get('privacy-settings')
  @UseGuards(JwtAuthGuard)
  async getPrivacySettings(@Request() req) {
    const user = req.user;
    return this.statsService.getRankingPrivacySettings(user.studentId);
  }

  /**
   * 랭킹 닉네임 변경
   */
  @Post('privacy-settings')
  @UseGuards(JwtAuthGuard)
  async updatePrivacySettings(
    @Request() req,
    @Body() body: { publicNickname?: string },
  ) {
    const user = req.user;
    return this.statsService.updateRankingPrivacy(
      user.studentId,
      true, // 항상 공개 (자동 참여)
      body.publicNickname,
    );
  }

  /**
   * 닉네임 마이그레이션 (관리자용)
   */
  @Post('migrate-nicknames')
  @UseGuards(JwtAuthGuard)
  async migrateNicknames() {
    return this.statsService.migrateNicknames();
  }

  /**
   * 공개 랭킹에서 내 순위 조회
   */
  @Get('my-public-rank')
  @UseGuards(JwtAuthGuard)
  async getMyPublicRank(@Request() req) {
    const user = req.user;
    return this.statsService.getPublicRankPosition(user.studentId);
  }

  /**
   * 특정 좌석의 이용 패턴 예측
   */
  @Get('prediction/:roomNo/:seatNo')
  async getSeatPrediction(
    @Param('roomNo') roomNo: string,
    @Param('seatNo') seatNo: string,
  ): Promise<SeatPredictionDto> {
    return this.statsService.getSeatPrediction(roomNo, seatNo);
  }
}

@Controller('api/v1/admin')
export class AdminController {
  constructor(private readonly calendarService: CalendarService) {}

  /**
   * 학사일정 등록 (관리자 전용)
   */
  @Post('calendar')
  @UseGuards(JwtAuthGuard) // 실제로는 관리자 권한 체크 필요
  @HttpCode(HttpStatus.CREATED)
  async createCalendarEvent(
    @Body() createDto: CreateAcademicCalendarDto,
  ): Promise<CalendarActionResponseDto> {
    try {
      const startDate = new Date(createDto.startDate);
      const endDate = new Date(createDto.endDate);

      await this.calendarService.createCalendarEvent(
        createDto.name,
        startDate,
        endDate,
        createDto.type,
        createDto.description,
      );

      return {
        success: true,
        message: '학사일정이 성공적으로 등록되었습니다.',
      };
    } catch (error: any) {
      return {
        success: false,
        message: '학사일정 등록 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * 활성 학사일정 목록 조회
   */
  @Get('calendar')
  @UseGuards(JwtAuthGuard)
  async getCalendarEvents() {
    return this.calendarService.getActiveCalendarEvents();
  }
}
