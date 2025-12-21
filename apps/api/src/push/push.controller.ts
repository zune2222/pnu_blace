import {
  Controller,
  Post,
  Delete,
  Body,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PushService } from './push.service';
import { RegisterTokenDto, UnregisterTokenDto } from './push.dto';

@Controller('api/v1/push')
@UseGuards(JwtAuthGuard)
export class PushController {
  private readonly logger = new Logger(PushController.name);

  constructor(private readonly pushService: PushService) {}

  /**
   * 디바이스 토큰 등록
   * POST /api/v1/push/token
   */
  @Post('token')
  async registerToken(
    @Request() req: any,
    @Body() dto: RegisterTokenDto,
  ): Promise<{ success: boolean; message: string }> {
    const studentId = req.user?.studentId;
    this.logger.log(`registerToken called: studentId=${studentId}, token=${dto.token?.slice(0, 20)}..., platform=${dto.platform}`);
    
    if (!studentId) {
      this.logger.warn('registerToken failed: studentId is undefined');
      return {
        success: false,
        message: '인증 정보를 찾을 수 없습니다.',
      };
    }
    
    await this.pushService.registerToken(studentId, dto.token, dto.platform);

    return {
      success: true,
      message: '푸시 토큰이 등록되었습니다.',
    };
  }

  /**
   * 디바이스 토큰 해제
   * DELETE /api/v1/push/token
   */
  @Delete('token')
  async unregisterToken(
    @Request() req: any,
    @Body() dto: UnregisterTokenDto,
  ): Promise<{ success: boolean; message: string }> {
    const studentId = req.user?.studentId;
    await this.pushService.unregisterToken(studentId, dto.token);

    return {
      success: true,
      message: '푸시 토큰이 해제되었습니다.',
    };
  }

  /**
   * 테스트 푸시 알림 발송 (본인에게)
   * POST /api/v1/push/test
   */
  @Post('test')
  async testPush(
    @Request() req: any,
    @Body() dto: { title?: string; body?: string },
  ): Promise<{ success: boolean; message: string }> {
    const studentId = req.user?.studentId;
    
    if (!studentId) {
      return {
        success: false,
        message: '인증 정보를 찾을 수 없습니다.',
      };
    }

    this.logger.log(`Test push to: ${studentId}`);

    const result = await this.pushService.sendToUser(studentId, {
      title: dto.title || '🔔 테스트 알림',
      body: dto.body || 'PNU Blace 푸시 알림이 정상적으로 작동합니다!',
      data: { type: 'test', timestamp: new Date().toISOString() },
    });

    return {
      success: result,
      message: result ? '푸시 알림이 발송되었습니다.' : '활성 토큰이 없거나 발송에 실패했습니다.',
    };
  }
}
