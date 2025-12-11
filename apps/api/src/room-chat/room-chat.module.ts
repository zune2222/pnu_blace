import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RoomChatMessage } from '@pnu-blace/db';
import { RoomChatGateway } from './room-chat.gateway';
import { RoomChatService } from './room-chat.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoomChatMessage]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '30d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [RoomChatGateway, RoomChatService],
  exports: [RoomChatService],
})
export class RoomChatModule {}
