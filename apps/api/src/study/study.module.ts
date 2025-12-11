import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  StudyGroup,
  StudyMember,
  JoinRequest,
  AttendanceRecord,
  VacationRequest,
  User,
  UserStats,
  PenaltyRecord,
} from '@pnu-blace/db';
import { StudyController, StudyPublicController } from './study.controller';
import { MemberController } from './member.controller';
import { StudyService } from './study.service';
import { AttendanceService } from './attendance.service';
import { MemberService } from './member.service';
import { PenaltyService } from './penalty.service';
import { SchoolApiModule } from '../school-api/school-api.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudyGroup,
      StudyMember,
      JoinRequest,
      AttendanceRecord,
      VacationRequest,
      User,
      UserStats,
      PenaltyRecord,
    ]),
    SchoolApiModule,
  ],
  controllers: [StudyPublicController, StudyController, MemberController],
  providers: [StudyService, AttendanceService, MemberService, PenaltyService],
  exports: [StudyService, AttendanceService, MemberService, PenaltyService],
})
export class StudyModule {}
