import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserProfileDto } from '@pnu-blace/types';

interface NotificationSettingsDto {
  studyChatNotification?: boolean;
  roomChatNotification?: boolean;
}

@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMyProfile(@Request() req): Promise<UserProfileDto> {
    const user = req.user; // JWT Guard에서 주입된 User 엔티티
    return this.usersService.getProfile(user.studentId);
  }

  @Get('notification-settings')
  async getNotificationSettings(@Request() req) {
    const user = req.user;
    return {
      studyChatNotification: user.studyChatNotification ?? true,
      roomChatNotification: user.roomChatNotification ?? true,
    };
  }

  @Patch('notification-settings')
  async updateNotificationSettings(
    @Request() req,
    @Body() dto: NotificationSettingsDto,
  ) {
    const studentId = req.user.studentId;
    await this.usersService.updateNotificationSettings(studentId, dto);
    return {
      success: true,
      message: '알림 설정이 저장되었습니다.',
    };
  }
}
