import { Module } from '@nestjs/common';
import { SchoolApiService } from './school-api.service';

@Module({
  providers: [SchoolApiService],
  exports: [SchoolApiService],
})
export class SchoolApiModule {}
