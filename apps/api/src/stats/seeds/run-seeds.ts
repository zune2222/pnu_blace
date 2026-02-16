import 'dotenv/config';
import { DataSource } from 'typeorm';
import {
  SeatEventLog,
  AcademicCalendar,
  User,
  MyUsageLog,
} from '@pnu-blace/db';
import { seedAcademicCalendar } from './seed-academic-calendar';
import { backfillPeriodType } from './backfill-period-type';

/**
 * 시드 스크립트 러너
 *
 * 사용법:
 *   DATABASE_URL=postgres://... npx ts-node apps/api/src/stats/seeds/run-seeds.ts
 *
 * 또는 .env 파일이 있는 경우:
 *   npx ts-node apps/api/src/stats/seeds/run-seeds.ts
 */
async function main() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [SeatEventLog, AcademicCalendar, User, MyUsageLog],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('DB 연결 성공');

  try {
    console.log('\n=== 1. 학사일정 시드 ===');
    await seedAcademicCalendar(dataSource);

    console.log('\n=== 2. periodType 백필 ===');
    await backfillPeriodType(dataSource);
  } finally {
    await dataSource.destroy();
    console.log('\nDB 연결 종료');
  }
}

main().catch((error) => {
  console.error('시드 실행 실패:', error);
  process.exit(1);
});
