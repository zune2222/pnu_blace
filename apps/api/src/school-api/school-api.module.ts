import { Module } from '@nestjs/common';
import { SchoolApiService } from './school-api.service';
import { AuthenticationService } from './authentication.service';
import { SeatOperationService } from './seat-operation.service';
import { SeatQueryService } from './seat-query.service';
import { XmlParsingService } from './xml-parsing.service';

@Module({
  providers: [
    SchoolApiService,
    AuthenticationService,
    SeatOperationService,
    SeatQueryService,
    XmlParsingService,
  ],
  exports: [SchoolApiService],
})
export class SchoolApiModule {}
