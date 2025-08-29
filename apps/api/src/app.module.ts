import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  User,
  SeatEventLog,
  MyUsageLog,
  NotificationRequest,
  AcademicCalendar,
  AutoExtensionConfig,
  QueueRequest,
} from '@pnu-blace/db';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SeatsModule } from './seats/seats.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { StatsModule } from './stats/stats.module';
import { SchoolApiModule } from './school-api/school-api.module';
import { RoomsModule } from './rooms/rooms.module';

@Module({
  imports: [
    // 1. ConfigModule을 가장 먼저 임포트합니다.
    ConfigModule.forRoot({
      isGlobal: true, // 모든 모듈에서 환경 변수를 쓸 수 있게 설정
    }),

    // 1-1. ScheduleModule 추가
    ScheduleModule.forRoot(),

    // 2. TypeOrmModule을 비동기 방식으로 설정합니다.
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        // Railway가 자동으로 제공하는 DATABASE_URL 환경 변수를 사용합니다.
        url: configService.get<string>('DATABASE_URL'),
        entities: [
          User,
          SeatEventLog,
          MyUsageLog,
          NotificationRequest,
          AcademicCalendar,
          AutoExtensionConfig,
          QueueRequest,
        ], // 모든 엔티티 클래스 추가
        synchronize: true, // 개발 환경에서는 true로 설정하여 테이블 자동 생성
        logging: true,
      }),
    }),

    // 3. 기능별 모듈들
    SchoolApiModule,
    AuthModule,
    UsersModule,
    SeatsModule,
    RoomsModule,
    NotificationsModule,
    SchedulerModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
