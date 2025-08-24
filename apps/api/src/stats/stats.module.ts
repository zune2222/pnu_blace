import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MyUsageLog,
  SeatEventLog,
  User,
  AcademicCalendar,
} from '@pnu-blace/db';
import { StatsController, AdminController } from './stats.controller';
import { StatsService } from './stats.service';
import { CalendarService } from './calendar.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MyUsageLog,
      SeatEventLog,
      User,
      AcademicCalendar,
    ]),
  ],
  controllers: [StatsController, AdminController],
  providers: [StatsService, CalendarService],
  exports: [StatsService, CalendarService],
})
export class StatsModule {}
