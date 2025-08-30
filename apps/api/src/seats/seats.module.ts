import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, MyUsageLog, AutoExtensionConfig, QueueRequest } from '@pnu-blace/db';
import { SeatsController } from './seats.controller';
import { SeatsService } from './seats.service';
import { SeatQueryService } from './seat-query.service';
import { SeatReservationService } from './seat-reservation.service';
import { SeatRendererService } from './seat-renderer.service';
import { SeatPredictionService } from './seat-prediction.service';
import { SeatAutoExtensionService } from './seat-auto-extension.service';
import { SeatQueueService } from './seat-queue.service';
import { SchoolApiModule } from '../school-api/school-api.module';
import { StatsModule } from '../stats/stats.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, MyUsageLog, AutoExtensionConfig, QueueRequest]),
    SchoolApiModule,
    StatsModule,
  ],
  controllers: [SeatsController],
  providers: [
    SeatsService,
    SeatQueryService,
    SeatReservationService,
    SeatRendererService,
    SeatPredictionService,
    SeatAutoExtensionService,
    SeatQueueService,
  ],
  exports: [SeatsService, SeatQueueService, SeatAutoExtensionService],
})
export class SeatsModule {}
