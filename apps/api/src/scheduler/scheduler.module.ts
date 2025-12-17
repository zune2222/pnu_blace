import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeatEventLog, NotificationRequest } from '@pnu-blace/db';
import { SeatMonitorService } from './seat-monitor.service';
import { SeatScannerService } from './scanner';
import { SeatChangeDetectorService } from './detector';
import { SeatNotificationProcessorService } from './processor';
import { SeatAutoReservorService } from './reservor';
import { SchoolApiModule } from '../school-api/school-api.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { StatsModule } from '../stats/stats.module';
import { SeatsModule } from '../seats/seats.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SeatEventLog, NotificationRequest]),
    SchoolApiModule,
    NotificationsModule,
    StatsModule,
    SeatsModule,
  ],
  providers: [
    SeatMonitorService,
    SeatScannerService,
    SeatChangeDetectorService,
    SeatNotificationProcessorService,
    SeatAutoReservorService,
  ],
  exports: [
    SeatMonitorService,
    SeatScannerService,
    SeatChangeDetectorService,
    SeatNotificationProcessorService,
    SeatAutoReservorService,
  ],
})
export class SchedulerModule {}

