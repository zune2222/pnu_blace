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
  async getSeatDetail(@Param('roomNo') roomNo: string): Promise<SeatDetailDto> {
    return this.seatsService.getSeatDetail(roomNo);
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
  async getSeatStatus(
    @Param('roomNo') roomNo: string,
  ): Promise<SeatStatusDto[]> {
    return this.seatsService.getSeatStatus(roomNo);
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
}
