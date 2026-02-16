import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MyUsageLog,
  SeatEventLog,
  User,
  AcademicCalendar,
  UserStats,
} from '@pnu-blace/db';
import { StatsController, AdminController } from './stats.controller';
import { StatsService } from './stats.service';
import { CalendarService } from './calendar.service';
import { SurvivalAnalysisService } from './survival-analysis.service';
import { SchoolApiModule } from '../school-api/school-api.module';
import { StudyModule } from '../study/study.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MyUsageLog,
      SeatEventLog,
      User,
      AcademicCalendar,
      UserStats,
    ]),
    SchoolApiModule,
    StudyModule,
  ],
  controllers: [StatsController, AdminController],
  providers: [StatsService, CalendarService, SurvivalAnalysisService],
  exports: [StatsService, CalendarService, SurvivalAnalysisService],
})
export class StatsModule {}
