import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceToken, User } from '@pnu-blace/db';
import { PushService } from './push.service';
import { PushController } from './push.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceToken, User])],
  controllers: [PushController],
  providers: [PushService],
  exports: [PushService],
})
export class PushModule {}
