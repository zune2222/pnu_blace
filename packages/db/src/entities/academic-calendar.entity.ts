import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class AcademicCalendar {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	name!: string; // 예: "2024-1학기 중간고사", "2024 여름방학"

	@Column({ type: "date" })
	startDate!: Date;

	@Column({ type: "date" })
	endDate!: Date;

	@Column({
		type: "varchar",
		length: 20,
		default: "NORMAL",
	})
	type!: "NORMAL" | "EXAM" | "VACATION" | "FINALS";

	@Column({ default: true })
	isActive!: boolean;

	@Column({ type: "text", nullable: true })
	description?: string;

	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	createdAt!: Date;
}
