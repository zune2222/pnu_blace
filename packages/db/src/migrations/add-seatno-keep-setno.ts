import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSeatNoKeepSetNo1710000000001 implements MigrationInterface {
	name = "AddSeatNoKeepSetNo1710000000001";

	public async up(queryRunner: QueryRunner): Promise<void> {
		// seat_event_log 테이블에 seatNo 컬럼 추가
		await queryRunner.query(
			`ALTER TABLE "seat_event_log" ADD COLUMN "seatNo" VARCHAR`,
		);

		// 기존 setNo 데이터를 seatNo로 복사
		await queryRunner.query(`UPDATE "seat_event_log" SET "seatNo" = "setNo"`);

		// notification_request 테이블에 seatNo 컬럼 추가
		await queryRunner.query(
			`ALTER TABLE "notification_request" ADD COLUMN "seatNo" VARCHAR`,
		);

		// 기존 setNo 데이터를 seatNo로 복사
		await queryRunner.query(
			`UPDATE "notification_request" SET "seatNo" = "setNo"`,
		);

		// my_usage_log 테이블에 seatNo 컬럼 추가
		await queryRunner.query(
			`ALTER TABLE "my_usage_log" ADD COLUMN "seatNo" VARCHAR`,
		);

		// 기존 setNo 데이터를 seatNo로 복사
		await queryRunner.query(`UPDATE "my_usage_log" SET "seatNo" = "setNo"`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// 롤백: seatNo 컬럼 제거
		await queryRunner.query(
			`ALTER TABLE "seat_event_log" DROP COLUMN "seatNo"`,
		);

		await queryRunner.query(
			`ALTER TABLE "notification_request" DROP COLUMN "seatNo"`,
		);

		await queryRunner.query(`ALTER TABLE "my_usage_log" DROP COLUMN "seatNo"`);
	}
}
