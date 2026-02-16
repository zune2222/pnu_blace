import { DataSource } from 'typeorm';

/**
 * SeatEventLog의 periodType을 학사일정 기준으로 일괄 갱신
 * raw SQL로 엔티티 로딩 없이 효율적 처리 (508K+ 레코드)
 * run-seeds.ts를 통해 실행하거나 DataSource를 직접 전달
 */
export async function backfillPeriodType(
  dataSource: DataSource,
): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // 먼저 모든 레코드를 NORMAL로 리셋
    const resetResult = await queryRunner.query(`
      UPDATE seat_event_log
      SET "periodType" = 'NORMAL'
      WHERE "periodType" != 'NORMAL'
    `);
    console.log(`[reset] NORMAL로 리셋: ${resetResult[1]} rows`);

    // AcademicCalendar에 등록된 기간별로 갱신
    const updateResult = await queryRunner.query(`
      UPDATE seat_event_log sel
      SET "periodType" = ac.type
      FROM academic_calendar ac
      WHERE ac."isActive" = true
        AND sel.timestamp::date >= ac."startDate"
        AND sel.timestamp::date <= ac."endDate"
    `);
    console.log(`[backfill] periodType 갱신: ${updateResult[1]} rows`);

    // 결과 확인
    const stats = await queryRunner.query(`
      SELECT "periodType", COUNT(*) as count
      FROM seat_event_log
      GROUP BY "periodType"
      ORDER BY count DESC
    `);
    console.log('[결과]', stats);

    await queryRunner.commitTransaction();
    console.log('periodType 백필 완료');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('백필 실패, 롤백됨:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}
