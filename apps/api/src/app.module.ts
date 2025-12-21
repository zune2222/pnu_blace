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
  FavoriteRoom,
  UserStats,
  StudyGroup,
  StudyMember,
  JoinRequest,
  AttendanceRecord,
  VacationRequest,
  PenaltyRecord,
  ChatMessage,
  RoomChatMessage,
  DeviceToken,
} from '@pnu-blace/db';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SeatsModule } from './seats/seats.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { StatsModule } from './stats/stats.module';
import { SchoolApiModule } from './school-api/school-api.module';
import { RoomsModule } from './rooms/rooms.module';
import { FavoritesModule } from './favorites/favorites.module';
import { StudyModule } from './study/study.module';
import { ChatModule } from './chat/chat.module';
import { RedisModule } from './redis/redis.module';
import { RoomChatModule } from './room-chat/room-chat.module';
import { PushModule } from './push/push.module';

@Module({
  imports: [
    // 1. ConfigModule을 가장 먼저 임포트합니다.
    ConfigModule.forRoot({
      isGlobal: true, // 모든 모듈에서 환경 변수를 쓸 수 있게 설정
    }),

    // 1-1. ScheduleModule 추가
    ScheduleModule.forRoot(),

    // 1-2. RedisModule (Global)
    RedisModule,

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
          FavoriteRoom,
          UserStats,
          StudyGroup,
          StudyMember,
          JoinRequest,
          AttendanceRecord,
          VacationRequest,
          PenaltyRecord,
          ChatMessage,
          RoomChatMessage,
          DeviceToken,
        ], // 모든 엔티티 클래스 추가
        synchronize: true, // 개발 환경에서는 true로 설정하여 테이블 자동 생성
        logging:
          configService.get('NODE_ENV') === 'development'
            ? ['error', 'warn', 'schema']
            : ['error'],
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
    FavoritesModule,
    StudyModule,
    ChatModule,
    RoomChatModule,
    PushModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

