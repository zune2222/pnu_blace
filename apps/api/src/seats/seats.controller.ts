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
  Res,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { SeatsService } from './seats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  SeatStatusDto,
  MySeatDto,
  ReserveSeatRequestDto,
  SeatActionResponseDto,
  ExtendSeatResponseDto,
  SeatDetailDto,
  SeatVacancyPredictionDto,
  AutoExtensionConfigDto,
  UpdateAutoExtensionConfigDto,
  AutoExtensionStatsDto,
  QueueRequestDto,
  AddToQueueRequestDto,
  QueueStatusDto,
  QueueStatsDto,
} from '@pnu-blace/types';

@Controller('api/v1/seats')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  /**
   * 현재 내가 예약한 좌석 정보 조회
   */
  @Get('my-seat')
  @UseGuards(JwtAuthGuard)
  async getMySeat(@Request() req): Promise<MySeatDto> {
    const user = req.user;
    return this.seatsService.getMySeat(user.studentId);
  }

  /**
   * 원본 PNU HTML을 가져와서 좌석 버튼만 교체해서 반환
   */
  @Get(':roomNo/html')
  async getSeatMapHtml(@Param('roomNo') roomNo: string, @Res() res: Response) {
    try {
      const loginResult = await this.seatsService.loginAsSystem();
      if (!loginResult.success) {
        return res.status(500).json({ error: '로그인 실패' });
      }

      const html = await this.seatsService.getSeatMapHtml(
        roomNo,
        loginResult.sessionID || '',
      );
      res.set('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (error) {
      res.status(500).json({ error: 'HTML 가져오기 실패' });
    }
  }

  /**
   * 특정 열람실의 상세 좌석 정보 조회
   */
  @Get(':roomNo/detail')
  @UseGuards(JwtAuthGuard)
  async getSeatDetail(
    @Param('roomNo') roomNo: string,
    @Request() req,
  ): Promise<SeatDetailDto> {
    const user = req.user;
    return this.seatsService.getSeatDetail(roomNo, user.studentId);
  }

  /**
   * 배경 이미지 프록시 (HTTPS 문제 해결)
   */
  @Get('background-image/:roomNo')
  async getBackgroundImage(
    @Param('roomNo') roomNo: string,
    @Res() res: Response,
  ) {
    try {
      const backgroundUrl = this.seatsService.getBackgroundImageUrl(roomNo);
      const fullUrl = `https://place.pusan.ac.kr${backgroundUrl}`;

      // 부산대학교 서버에서 이미지를 가져와서 클라이언트에게 전달
      const response = await fetch(fullUrl);

      if (!response.ok) {
        return res.status(404).json({ error: 'Image not found' });
      }

      const buffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      res.set({
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // 1시간 캐시
      });

      res.send(Buffer.from(buffer));
    } catch (error) {
      res.status(500).json({ error: 'Failed to load image' });
    }
  }

  /**
   * 특정 열람실의 전체 좌석 상태 조회
   */
  @Get(':roomNo')
  @UseGuards(JwtAuthGuard)
  async getSeatStatus(
    @Param('roomNo') roomNo: string,
    @Request() req,
  ): Promise<SeatStatusDto[]> {
    const user = req.user;
    return this.seatsService.getSeatStatus(roomNo, user.studentId);
  }

  /**
   * 좌석 예약
   */
  @Post('reserve')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async reserveSeat(
    @Request() req,
    @Body() reserveSeatDto: ReserveSeatRequestDto,
  ): Promise<SeatActionResponseDto> {
    const user = req.user;
    return this.seatsService.reserveSeat(user.studentId, reserveSeatDto);
  }


  /**
   * 좌석 반납
   */
  @Post('return')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async returnSeat(@Request() req): Promise<SeatActionResponseDto> {
    const user = req.user;
    return this.seatsService.returnSeat(user.studentId);
  }

  /**
   * 좌석 연장
   */
  @Post('extend')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async extendSeat(@Request() req): Promise<ExtendSeatResponseDto> {
    const user = req.user;
    return this.seatsService.extendSeat(user.studentId);
  }

  /**
   * 좌석 반납 예측 시간 조회
   */
  @Get(':roomNo/:seatNo/prediction')
  async getSeatPrediction(
    @Param('roomNo') roomNo: string,
    @Param('seatNo') seatNo: string,
  ): Promise<SeatVacancyPredictionDto> {
    return this.seatsService.getSeatPrediction(roomNo, seatNo);
  }

  // ================================
  // 자동 연장 관련 엔드포인트
  // ================================

  /**
   * 자동 연장 설정 조회
   */
  @Get('auto-extension/config')
  @UseGuards(JwtAuthGuard)
  async getAutoExtensionConfig(
    @Request() req,
  ): Promise<AutoExtensionConfigDto | null> {
    const user = req.user;
    return this.seatsService.getAutoExtensionConfig(user.studentId);
  }

  /**
   * 자동 연장 설정 업데이트
   */
  @Post('auto-extension/config')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateAutoExtensionConfig(
    @Request() req,
    @Body() configDto: UpdateAutoExtensionConfigDto,
  ): Promise<AutoExtensionConfigDto> {
    const user = req.user;
    return this.seatsService.updateAutoExtensionConfig(
      user.studentId,
      configDto,
    );
  }

  /**
   * 자동 연장 토글 (활성화/비활성화)
   */
  @Post('auto-extension/toggle')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async toggleAutoExtension(
    @Request() req,
    @Body() body: { isEnabled: boolean },
  ): Promise<AutoExtensionConfigDto> {
    const user = req.user;
    return this.seatsService.toggleAutoExtension(
      user.studentId,
      body.isEnabled,
    );
  }

  /**
   * 자동 연장 통계 조회
   */
  @Get('auto-extension/stats')
  @UseGuards(JwtAuthGuard)
  async getAutoExtensionStats(@Request() req): Promise<AutoExtensionStatsDto> {
    const user = req.user;
    return this.seatsService.getAutoExtensionStats(user.studentId);
  }

  /**
   * 수동으로 자동 연장 실행 (테스트용)
   */
  @Post('auto-extension/execute')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async executeAutoExtension(@Request() req): Promise<SeatActionResponseDto> {
    const user = req.user;
    return this.seatsService.executeAutoExtension();
  }

  // ================================
  // 대기열 관련 엔드포인트
  // ================================

  /**
   * 좌석 예약 대기열에 추가
   */
  @Post('queue/reservation')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async addSeatReservationToQueue(
    @Request() req,
    @Body() queueDto: AddToQueueRequestDto,
  ): Promise<QueueRequestDto> {
    const user = req.user;
    const { roomNo, seatNo, scheduledAt } = queueDto;

    if (!roomNo || !seatNo) {
      throw new BadRequestException('roomNo와 seatNo는 필수입니다.');
    }

    return this.seatsService.addSeatReservationToQueue(
      user.studentId,
      roomNo,
      seatNo,
      scheduledAt,
    );
  }

  /**
   * 사용자 대기열 상태 조회
   */
  @Get('queue/status')
  @UseGuards(JwtAuthGuard)
  async getUserQueueStatus(@Request() req): Promise<QueueStatusDto> {
    const user = req.user;
    return this.seatsService.getUserQueueStatus(user.studentId);
  }

  /**
   * 대기열에서 요청 취소
   */
  @Post('queue/reservation/cancel')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async cancelQueueRequest(@Request() req): Promise<SeatActionResponseDto> {
    const user = req.user;

    const success = await this.seatsService.cancelQueueRequest(
      user.studentId,
    );

    return {
      success,
      message: success
        ? '빈자리 예약 대기열 요청이 취소되었습니다.'
        : '취소할 요청을 찾을 수 없습니다.',
    };
  }

  /**
   * 대기열 통계 조회 (관리자용)
   */
  @Get('queue/stats')
  @UseGuards(JwtAuthGuard)
  async getQueueStats(): Promise<QueueStatsDto> {
    return this.seatsService.getQueueStats();
  }
}
