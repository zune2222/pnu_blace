import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SeatQueueService } from '../../seats/seat-queue.service';

@Injectable()
export class SeatQueueProcessorService {
  private readonly logger = new Logger(SeatQueueProcessorService.name);

  constructor(private seatQueueService: SeatQueueService) {}

  /**
   * 매 1분마다 대기열 처리
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processQueue() {
    try {
      this.logger.debug('Processing seat reservation queue...');

      const result = await this.seatQueueService.processQueue();

      if (result.processed > 0) {
        this.logger.log(
          `Queue processed: ${result.successful} successful, ${result.failed} failed`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Queue processing failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 매 10분마다 오래된 대기열 정리
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async cleanupOldQueue() {
    try {
      this.logger.debug('Cleaning up old queue requests...');

      const result = await this.seatQueueService.cleanupOldRequests();

      if (result.cleaned > 0) {
        this.logger.log(`Cleaned up ${result.cleaned} old queue requests`);
      }
    } catch (error) {
      this.logger.error(
        `Queue cleanup failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
