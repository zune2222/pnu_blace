import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDisplayNameToJoinRequest1710000000001
	implements MigrationInterface
{
	name = "AddDisplayNameToJoinRequest1710000000001";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "join_request" ADD "displayName" text`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "join_request" DROP COLUMN "displayName"`,
		);
	}
}




