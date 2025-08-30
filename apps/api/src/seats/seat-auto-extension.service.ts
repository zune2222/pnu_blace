import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, AutoExtensionConfig } from '@pnu-blace/db';
import { SchoolApiService } from '../school-api/school-api.service';

@Injectable()
export class SeatAutoExtensionService {
  private readonly logger = new Logger(SeatAutoExtensionService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AutoExtensionConfig)
    private autoExtensionConfigRepository: Repository<AutoExtensionConfig>,
    private schoolApiService: SchoolApiService,
  ) {}

  /**
   * 사용자의 자동 연장 설정 조회
   */
  async getAutoExtensionConfig(
    studentId: string,
  ): Promise<AutoExtensionConfig | null> {
    return this.autoExtensionConfigRepository.findOne({
      where: { studentId },
    });
  }

  /**
   * 사용자의 자동 연장 설정 생성 또는 업데이트
   */
  async upsertAutoExtensionConfig(
    studentId: string,
    config: Partial<AutoExtensionConfig>,
  ): Promise<AutoExtensionConfig> {
    const existingConfig = await this.getAutoExtensionConfig(studentId);

    if (existingConfig) {
      Object.assign(existingConfig, config);
      return this.autoExtensionConfigRepository.save(existingConfig);
    } else {
      const newConfig = this.autoExtensionConfigRepository.create({
        studentId,
        ...config,
      });
      return this.autoExtensionConfigRepository.save(newConfig);
    }
  }

  /**
   * 자동 연장 활성화/비활성화
   */
  async toggleAutoExtension(
    studentId: string,
    isEnabled: boolean,
  ): Promise<AutoExtensionConfig> {
    return this.upsertAutoExtensionConfig(studentId, { isEnabled });
  }

  /**
   * 연장이 필요한 모든 사용자 조회 및 처리
   */
  async processAutoExtensions(): Promise<{
    processed: number;
    successful: number;
    failed: number;
  }> {
    const configs = await this.autoExtensionConfigRepository.find({
      where: { isEnabled: true },
    });

    let processed = 0;
    let successful = 0;
    let failed = 0;

    for (const config of configs) {
      try {
        // 오늘 날짜로 카운트 리셋 체크
        await this.resetDailyCountIfNeeded(config);

        // 시스템 계정으로 로그인
        const systemLogin = await this.schoolApiService.loginAsSystem();
        if (!systemLogin.success || !systemLogin.sessionID) {
          this.logger.error('시스템 계정 로그인 실패');
          continue;
        }

        // 현재 좌석 정보 조회 (시스템 계정 사용)
        const currentSeat = await this.schoolApiService.getMySeat(
          config.studentId,
          systemLogin.sessionID,
        );

        if (!currentSeat || !currentSeat.endTime) {
          continue;
        }

        // 사용자 정보는 여전히 필요 (executeAutoExtension에서 사용)
        const user = await this.userRepository.findOne({
          where: { studentId: config.studentId },
        });

        if (!user) {
          continue;
        }

        // 남은 시간 계산 (분 단위)
        const endTime = new Date(currentSeat.endTime);
        const now = new Date();
        const remainingMinutes = Math.floor(
          (endTime.getTime() - now.getTime()) / (1000 * 60),
        );

        // 자동 연장 조건 확인
        if (this.shouldAutoExtend(config, remainingMinutes, now)) {
          processed++;
          const result = await this.executeAutoExtension(config, user);

          if (result.success) {
            successful++;
            this.logger.log(
              `Auto extension successful for ${config.studentId}`,
            );
          } else {
            failed++;
            this.logger.warn(
              `Auto extension failed for ${config.studentId}: ${result.message}`,
            );
          }
        }
      } catch (error) {
        failed++;
        this.logger.error(
          `Failed to process auto extension for ${config.studentId}: ${error.message}`,
        );
      }
    }

    this.logger.log(
      `Auto extension batch complete - Processed: ${processed}, Successful: ${successful}, Failed: ${failed}`,
    );

    return { processed, successful, failed };
  }

  /**
   * 자동 연장 비활성화
   */
  private async deactivateAutoExtension(studentId: string): Promise<void> {
    const config = await this.autoExtensionConfigRepository.findOne({
      where: { studentId },
    });

    if (config && config.isEnabled) {
      config.isEnabled = false;
      await this.autoExtensionConfigRepository.save(config);
      this.logger.log(`Auto extension deactivated for student: ${studentId}`);
    }
  }

  /**
   * 자동 연장 실행 (스케줄러 내부용)
   */
  private async executeAutoExtension(
    config: AutoExtensionConfig,
    user: User,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // 시스템 계정으로 로그인
      const systemLogin = await this.schoolApiService.loginAsSystem();
      if (!systemLogin.success || !systemLogin.sessionID) {
        return {
          success: false,
          message: '시스템 계정 로그인에 실패했습니다.',
        };
      }

      // 현재 좌석 상태 확인 (시스템 계정 사용)
      const currentSeat = await this.schoolApiService.getMySeat(
        config.studentId,
        systemLogin.sessionID,
      );

      // 좌석이 없거나 종료 시간이 없으면 자동 연장 비활성화
      if (!currentSeat || !currentSeat.endTime) {
        await this.deactivateAutoExtension(config.studentId);
        return {
          success: false,
          message: '현재 좌석이 없어서 자동 연장이 비활성화되었습니다.',
        };
      }

      // 좌석 연장 실행 (시스템 계정 + 대상 학번 사용)
      const extendResult = await this.schoolApiService.extendSeat(
        config.studentId,
        systemLogin.sessionID,
        currentSeat.roomNo || '',
        currentSeat.seatNo || '',
      );

      if (extendResult.success) {
        // 연장 횟수 증가
        config.currentExtensionCount++;
        config.lastExtendedAt = new Date();
        await this.autoExtensionConfigRepository.save(config);

        return {
          success: true,
          message: `자동으로 좌석이 연장되었습니다. (${config.currentExtensionCount}/${config.maxAutoExtensions})`,
        };
      } else {
        return {
          success: false,
          message: extendResult.message || '자동 연장에 실패했습니다.',
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '알 수 없는 오류';

      return {
        success: false,
        message: '자동 연장 중 오류가 발생했습니다: ' + errorMessage,
      };
    }
  }

  /**
   * 수동 자동 연장 실행 (API용)
   */
  async executeManualAutoExtension(studentId: string): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> {
    try {
      const config = await this.getAutoExtensionConfig(studentId);

      if (!config || !config.isEnabled) {
        return {
          success: false,
          message: '자동 연장이 비활성화되어 있습니다.',
        };
      }

      const user = await this.userRepository.findOne({
        where: { studentId },
      });

      if (!user || !user.schoolSessionId) {
        return {
          success: false,
          message: '사용자 세션을 찾을 수 없습니다.',
        };
      }

      const result = await this.executeAutoExtension(config, user);

      return {
        success: result.success,
        message: result.message,
        error: result.success ? undefined : result.message,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '알 수 없는 오류';
      this.logger.error(
        `Manual auto extension failed for ${studentId}: ${errorMessage}`,
      );

      return {
        success: false,
        message: '자동 연장 중 오류가 발생했습니다.',
        error: errorMessage,
      };
    }
  }

  /**
   * 자동 연장 조건 확인
   */
  private shouldAutoExtend(
    config: AutoExtensionConfig,
    remainingMinutes: number,
    currentTime: Date,
  ): boolean {
    // 트리거 시간 확인
    if (remainingMinutes > config.triggerMinutesBefore) {
      return false;
    }

    // 최대 연장 횟수 확인
    if (config.currentExtensionCount >= config.maxAutoExtensions) {
      return false;
    }

    // 시간 제한 확인
    if (!this.isWithinTimeRestriction(config, currentTime)) {
      return false;
    }

    // 이미 최근에 연장했는지 확인 (중복 방지)
    if (config.lastExtendedAt) {
      const timeSinceLastExtension =
        currentTime.getTime() - config.lastExtendedAt.getTime();
      const minutesSinceLastExtension = Math.floor(
        timeSinceLastExtension / (1000 * 60),
      );

      // 10분 이내에 이미 연장했으면 스킵
      if (minutesSinceLastExtension < 10) {
        return false;
      }
    }

    return true;
  }

  /**
   * 시간 제한 확인 (요일별, 시간대별)
   */
  private isWithinTimeRestriction(
    config: AutoExtensionConfig,
    currentTime: Date,
  ): boolean {
    const dayOfWeek = currentTime.getDay(); // 0: 일요일, 1: 월요일, ...
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    // 요일 제한 확인
    if (
      config.timeRestriction === 'WEEKDAYS' &&
      (dayOfWeek === 0 || dayOfWeek === 6)
    ) {
      return false;
    }
    if (
      config.timeRestriction === 'WEEKENDS' &&
      dayOfWeek !== 0 &&
      dayOfWeek !== 6
    ) {
      return false;
    }

    // 시간대 제한 확인
    if (config.startTime && config.endTime) {
      return (
        currentTimeString >= config.startTime &&
        currentTimeString <= config.endTime
      );
    }

    return true;
  }

  /**
   * 사용자의 자동 연장 통계 조회
   */
  async getAutoExtensionStats(studentId: string): Promise<{
    isEnabled: boolean;
    currentExtensionCount: number;
    maxAutoExtensions: number;
    remainingExtensions: number;
    lastExtendedAt?: Date;
    nextTriggerMinutes?: number;
  }> {
    const config = await this.getAutoExtensionConfig(studentId);

    if (!config) {
      return {
        isEnabled: false,
        currentExtensionCount: 0,
        maxAutoExtensions: 0,
        remainingExtensions: 0,
      };
    }

    return {
      isEnabled: config.isEnabled,
      currentExtensionCount: config.currentExtensionCount,
      maxAutoExtensions: config.maxAutoExtensions,
      remainingExtensions:
        config.maxAutoExtensions - config.currentExtensionCount,
      lastExtendedAt: config.lastExtendedAt,
      nextTriggerMinutes: config.triggerMinutesBefore,
    };
  }

  /**
   * 하루가 지나면 연장 카운트 리셋
   */
  private async resetDailyCountIfNeeded(
    config: AutoExtensionConfig,
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식

    if (config.lastResetDate !== today) {
      config.currentExtensionCount = 0;
      config.lastResetDate = today;
      config.lastExtendedAt = undefined;
      await this.autoExtensionConfigRepository.save(config);
    }
  }

  /**
   * 새로운 좌석 예약 시 연장 카운트 초기화 (필요시 호출)
   */
  async resetExtensionCount(studentId: string): Promise<void> {
    const config = await this.getAutoExtensionConfig(studentId);

    if (config) {
      config.currentExtensionCount = 0;
      config.lastExtendedAt = undefined;
      await this.autoExtensionConfigRepository.save(config);
    }
  }
}
