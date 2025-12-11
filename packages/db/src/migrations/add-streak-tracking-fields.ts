import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStreakTrackingFields1734000000001 implements MigrationInterface {
  name = "AddStreakTrackingFields1734000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // UserStats 테이블에 연속성 추적 필드 추가
    await queryRunner.query(
      `ALTER TABLE "user_stats" ADD "currentStreak" integer DEFAULT 0 NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_stats" ADD "longestStreak" integer DEFAULT 0 NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_stats" ADD "lastStudyDate" date`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_stats" ADD "streakStartDate" date`,
    );

    // StudyMember 테이블에 연속성 추적 필드 추가
    await queryRunner.query(
      `ALTER TABLE "study_member" ADD "currentStreak" integer DEFAULT 0 NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_member" ADD "longestStreak" integer DEFAULT 0 NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_member" ADD "lastAttendanceDate" date`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_member" ADD "streakStartDate" date`,
    );

    // 기존 출석 데이터를 기반으로 초기 연속성 데이터 생성
    await this.calculateInitialStreakData(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // StudyMember 테이블에서 연속성 필드 제거
    await queryRunner.query(
      `ALTER TABLE "study_member" DROP COLUMN "streakStartDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_member" DROP COLUMN "lastAttendanceDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_member" DROP COLUMN "longestStreak"`,
    );
    await queryRunner.query(
      `ALTER TABLE "study_member" DROP COLUMN "currentStreak"`,
    );

    // UserStats 테이블에서 연속성 필드 제거
    await queryRunner.query(
      `ALTER TABLE "user_stats" DROP COLUMN "streakStartDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_stats" DROP COLUMN "lastStudyDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_stats" DROP COLUMN "longestStreak"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_stats" DROP COLUMN "currentStreak"`,
    );
  }

  private async calculateInitialStreakData(queryRunner: QueryRunner): Promise<void> {
    // StudyMember별 연속성 계산
    const members = await queryRunner.query(`
      SELECT DISTINCT "groupId", "studentId" 
      FROM "study_member"
    `);

    for (const member of members) {
      await this.calculateMemberStreak(queryRunner, member.groupId, member.studentId);
    }

    // UserStats별 전체 연속성 계산
    const users = await queryRunner.query(`
      SELECT DISTINCT "studentId" 
      FROM "attendance_record"
    `);

    for (const user of users) {
      await this.calculateUserOverallStreak(queryRunner, user.studentId);
    }
  }

  private async calculateMemberStreak(
    queryRunner: QueryRunner,
    groupId: string,
    studentId: string,
  ): Promise<void> {
    // 해당 멤버의 모든 출석 기록을 날짜순으로 조회
    const records = await queryRunner.query(`
      SELECT "date", "status" 
      FROM "attendance_record" 
      WHERE "groupId" = $1 AND "studentId" = $2 
      ORDER BY "date" ASC
    `, [groupId, studentId]);

    if (records.length === 0) return;

    const validStatuses = ['PRESENT', 'LATE', 'VACATION'];
    let currentStreak = 0;
    let longestStreak = 0;
    let streakStartDate: Date | null = null;
    let lastAttendanceDate: Date | null = null;

    let previousDate: Date | null = null;
    let currentStreakStart: Date | null = null;

    for (const record of records) {
      const recordDate = new Date(record.date);
      const isValidAttendance = validStatuses.includes(record.status);

      if (isValidAttendance) {
        lastAttendanceDate = recordDate;

        if (!previousDate || this.getDaysDifference(previousDate, recordDate) === 1) {
          // 연속성 유지 또는 시작
          if (currentStreak === 0) {
            currentStreakStart = recordDate;
          }
          currentStreak++;
        } else {
          // 연속성 끊어짐
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
          currentStreakStart = recordDate;
        }

        previousDate = recordDate;
      } else {
        // 결석으로 연속성 끊어짐
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 0;
        currentStreakStart = null;
        previousDate = null;
      }
    }

    // 최종 최고 기록 업데이트
    longestStreak = Math.max(longestStreak, currentStreak);
    streakStartDate = currentStreakStart;

    // 연속성 데이터 업데이트
    await queryRunner.query(`
      UPDATE "study_member" 
      SET "currentStreak" = $1, 
          "longestStreak" = $2, 
          "lastAttendanceDate" = $3, 
          "streakStartDate" = $4
      WHERE "groupId" = $5 AND "studentId" = $6
    `, [currentStreak, longestStreak, lastAttendanceDate, streakStartDate, groupId, studentId]);
  }

  private async calculateUserOverallStreak(
    queryRunner: QueryRunner,
    studentId: string,
  ): Promise<void> {
    // 해당 사용자의 모든 출석 기록을 날짜별로 그룹화하여 조회
    const records = await queryRunner.query(`
      SELECT "date", 
             BOOL_OR("status" IN ('PRESENT', 'LATE', 'VACATION')) as "hasValidAttendance"
      FROM "attendance_record" 
      WHERE "studentId" = $1 
      GROUP BY "date"
      ORDER BY "date" ASC
    `, [studentId]);

    if (records.length === 0) return;

    let currentStreak = 0;
    let longestStreak = 0;
    let streakStartDate: Date | null = null;
    let lastStudyDate: Date | null = null;

    let previousDate: Date | null = null;
    let currentStreakStart: Date | null = null;

    for (const record of records) {
      const recordDate = new Date(record.date);
      const hasValidAttendance = record.hasValidAttendance;

      if (hasValidAttendance) {
        lastStudyDate = recordDate;

        if (!previousDate || this.getDaysDifference(previousDate, recordDate) === 1) {
          // 연속성 유지 또는 시작
          if (currentStreak === 0) {
            currentStreakStart = recordDate;
          }
          currentStreak++;
        } else {
          // 연속성 끊어짐
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
          currentStreakStart = recordDate;
        }

        previousDate = recordDate;
      } else {
        // 결석으로 연속성 끊어짐
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 0;
        currentStreakStart = null;
        previousDate = null;
      }
    }

    // 최종 최고 기록 업데이트
    longestStreak = Math.max(longestStreak, currentStreak);
    streakStartDate = currentStreakStart;

    // UserStats가 없으면 생성
    const existingStats = await queryRunner.query(`
      SELECT "studentId" FROM "user_stats" WHERE "studentId" = $1
    `, [studentId]);

    if (existingStats.length === 0) {
      await queryRunner.query(`
        INSERT INTO "user_stats" (
          "studentId", "totalUsageHours", "totalSessions", "totalDays", 
          "averageSessionHours", "favoriteRoomVisits", "favoriteRoomHours",
          "weeklyUsageHours", "weeklySessions", "weeklyDays", "tier", 
          "isPublicRanking", "currentStreak", "longestStreak", 
          "lastStudyDate", "streakStartDate"
        ) VALUES (
          $1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'Explorer', false, $2, $3, $4, $5
        )
      `, [studentId, currentStreak, longestStreak, lastStudyDate, streakStartDate]);
    } else {
      // 연속성 데이터 업데이트
      await queryRunner.query(`
        UPDATE "user_stats" 
        SET "currentStreak" = $1, 
            "longestStreak" = $2, 
            "lastStudyDate" = $3, 
            "streakStartDate" = $4
        WHERE "studentId" = $5
      `, [currentStreak, longestStreak, lastStudyDate, streakStartDate, studentId]);
    }
  }

  private getDaysDifference(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}