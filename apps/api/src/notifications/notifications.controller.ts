import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateNotificationRequestDto,
  NotificationRequestDto,
  NotificationActionResponseDto,
} from '@pnu-blace/types';

@Controller('api/v1/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * 빈자리 알림 신청
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createNotification(
    @Request() req,
    @Body() createDto: CreateNotificationRequestDto,
  ): Promise<NotificationActionResponseDto> {
    const user = req.user;
    return this.notificationsService.createNotification(
      user.studentId,
      createDto,
    );
  }

  /**
   * 내가 신청한 알림 목록 조회
   */
  @Get()
  async getMyNotifications(@Request() req): Promise<NotificationRequestDto[]> {
    const user = req.user;
    return this.notificationsService.getMyNotifications(user.studentId);
  }

  /**
   * 알림 신청 취소
   */
  @Delete(':requestId')
  @HttpCode(HttpStatus.OK)
  async cancelNotification(
    @Request() req,
    @Param('requestId', ParseIntPipe) requestId: number,
  ): Promise<NotificationActionResponseDto> {
    const user = req.user;
    return this.notificationsService.cancelNotification(
      user.studentId,
      requestId,
    );
  }
}
