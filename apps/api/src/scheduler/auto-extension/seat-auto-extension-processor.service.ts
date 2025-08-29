import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SeatAutoExtensionService } from '../../seats/seat-auto-extension.service';

@Injectable()
export class SeatAutoExtensionProcessorService {
  private readonly logger = new Logger(SeatAutoExtensionProcessorService.name);
  private isProcessing = false;

  constructor(private seatAutoExtensionService: SeatAutoExtensionService) {}

  /**
   * 매 5분마다 자동 연장 처리
   */
  @Cron('*/5 * * * *', {
    name: 'auto-extension-processor',
    timeZone: 'Asia/Seoul',
  })
  async processAutoExtensions() {
    if (this.isProcessing) {
      this.logger.debug(
        'Auto extension processing is already running, skipping...',
      );
      return;
    }

    this.isProcessing = true;

    try {
      this.logger.log('Starting auto extension processing batch...');

      const result =
        await this.seatAutoExtensionService.processAutoExtensions();

      this.logger.log(
        `Auto extension batch completed - ` +
          `Processed: ${result.processed}, ` +
          `Successful: ${result.successful}, ` +
          `Failed: ${result.failed}`,
      );

      // 결과에 따른 알람 처리 (실패가 많으면 알림 등)
      if (result.failed > 5) {
        this.logger.warn(
          `High failure rate in auto extensions: ${result.failed} failures`,
        );
      }
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Auto extension processing failed:', errorMessage);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * 수동으로 자동 연장 배치 실행 (테스트/관리용)
   */
  async manualProcessAutoExtensions(): Promise<{
    processed: number;
    successful: number;
    failed: number;
  }> {
    if (this.isProcessing) {
      throw new Error('Auto extension processing is already running');
    }

    this.logger.log('Manual auto extension processing triggered');
    return this.seatAutoExtensionService.processAutoExtensions();
  }

  /**
   * 현재 처리 상태 조회
   */
  isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }
}
