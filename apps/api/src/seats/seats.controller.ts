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
import { SeatsService } from './seats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  SeatStatusDto,
  MySeatDto,
  ReserveSeatRequestDto,
  SeatActionResponseDto,
  ExtendSeatResponseDto,
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
