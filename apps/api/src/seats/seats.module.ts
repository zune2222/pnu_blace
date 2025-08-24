import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, MyUsageLog } from '@pnu-blace/db';
import { SeatsController } from './seats.controller';
import { SeatsService } from './seats.service';
import { SchoolApiModule } from '../school-api/school-api.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, MyUsageLog]), SchoolApiModule],
  controllers: [SeatsController],
  providers: [SeatsService],
  exports: [SeatsService],
})
export class SeatsModule {}
