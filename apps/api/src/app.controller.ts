import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { SchoolApiService } from './school-api/school-api.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly schoolApiService: SchoolApiService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('debug/seat/:roomNo')
  async debugSeatMap(@Param('roomNo') roomNo: string) {
    try {
      // 디버깅용으로는 시스템 계정 사용 (개발/운영 중 문제 진단용)
      const loginResult = await this.schoolApiService.loginAsSystem();
      if (!loginResult.success) {
        return { error: 'Login failed', message: loginResult.errorMessage };
      }

      const seats = await this.schoolApiService.getSeatMap(
        roomNo,
        loginResult.sessionID,
      );
      return {
        roomNo,
        seatCount: seats.length,
        seats: seats.slice(0, 5), // 처음 5개만 보여주기
        message:
          seats.length === 0
            ? 'No seats found - check logs for HTML preview'
            : 'Success',
      };
    } catch (error) {
      return { error: 'Failed to get seat map', message: error?.message };
    }
  }

  @Get('debug/userinfo')
  async debugUserInfo() {
    try {
      // 디버깅용으로는 시스템 계정 사용 (개발/운영 중 문제 진단용)
      const loginResult = await this.schoolApiService.loginAsSystem();
      if (!loginResult.success) {
        return { error: 'Login failed', message: loginResult.errorMessage };
      }

      const userInfo = await this.schoolApiService.getUserInfo(
        loginResult.sessionID!,
      );
      return {
        success: !!userInfo,
        userInfo: userInfo || 'No user info found',
        sessionID: loginResult.sessionID,
      };
    } catch (error) {
      return { error: 'Failed to get user info', message: error.message };
    }
  }
}
