import { Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { SchoolApiService } from './school-api/school-api.service';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly schoolApiService: SchoolApiService,
    private readonly usersService: UsersService,
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
        loginResult.userID!,
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

  @Post('debug/backfill-users')
  async backfillUsers() {
    try {
      // 1. 시스템 계정으로 세션 획득
      const loginResult = await this.schoolApiService.loginAsSystem();
      if (!loginResult.success) {
        return { error: 'System login failed', message: loginResult.errorMessage };
      }

      // 2. 잘못된 데이터를 가진 유저 조회
      const badUsers = await this.usersService.findUsersWithBadData();
      if (badUsers.length === 0) {
        return { message: 'No users with bad data found', updated: 0 };
      }

      // 3. 각 유저의 정보를 학교 API에서 가져와서 업데이트
      const results: Array<{ studentId: string; status: string; name?: string; major?: string; reason?: string }> = [];
      for (const user of badUsers) {
        try {
          const userInfo = await this.schoolApiService.getUserInfo(
            loginResult.sessionID!,
            user.studentId,
          );

          if (userInfo && userInfo.userName) {
            await this.usersService.saveUserFromAPI(userInfo);
            results.push({
              studentId: user.studentId,
              status: 'updated',
              name: userInfo.userName,
              major: userInfo.deptName,
            });
          } else {
            results.push({
              studentId: user.studentId,
              status: 'skipped',
              reason: 'No user info from school API',
            });
          }
        } catch (err) {
          results.push({
            studentId: user.studentId,
            status: 'failed',
            reason: err.message,
          });
        }
      }

      return {
        total: badUsers.length,
        updated: results.filter((r) => r.status === 'updated').length,
        results,
      };
    } catch (error) {
      return { error: 'Backfill failed', message: error.message };
    }
  }
}
