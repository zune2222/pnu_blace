import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameSetNoToSeatNo1710000000000 implements MigrationInterface {
	name = "RenameSetNoToSeatNo1710000000000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		// seat_event_log 테이블의 setNo 컬럼을 seatNo로 변경
		await queryRunner.query(
			`ALTER TABLE "seat_event_log" RENAME COLUMN "setNo" TO "seatNo"`,
		);

		// notification_request 테이블의 setNo 컬럼을 seatNo로 변경
		await queryRunner.query(
			`ALTER TABLE "notification_request" RENAME COLUMN "setNo" TO "seatNo"`,
		);

		// my_usage_log 테이블의 setNo 컬럼을 seatNo로 변경
		await queryRunner.query(
			`ALTER TABLE "my_usage_log" RENAME COLUMN "setNo" TO "seatNo"`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// 롤백: seatNo를 다시 setNo로 변경
		await queryRunner.query(
			`ALTER TABLE "seat_event_log" RENAME COLUMN "seatNo" TO "setNo"`,
		);

		await queryRunner.query(
			`ALTER TABLE "notification_request" RENAME COLUMN "seatNo" TO "setNo"`,
		);

		await queryRunner.query(
			`ALTER TABLE "my_usage_log" RENAME COLUMN "seatNo" TO "setNo"`,
		);
	}
}
