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
