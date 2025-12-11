import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	ManyToOne,
	JoinColumn,
	Relation,
	Index,
} from "typeorm";

export type PenaltyType = "LATE" | "ABSENT" | "EARLY_LEAVE" | "MANUAL";

@Entity()
@Index("idx_penalty_record_group", ["groupId"])
@Index("idx_penalty_record_student", ["studentId"])
@Index("idx_penalty_record_date", ["date"])
export class PenaltyRecord {
	@PrimaryGeneratedColumn("uuid")
	penaltyId!: string;

	@Column()
	groupId!: string;

	@Column()
	studentId!: string;

	@Column({ type: "varchar", length: 20 })
	type!: PenaltyType;

	@Column({ type: "int" })
	points!: number; // 부여된 벌점

	@Column({ type: "date" })
	date!: Date; // 벌점 발생일

	@Column({ nullable: true })
	attendanceRecordId?: string; // 연결된 출석 기록 (자동 생성 시)

	@Column({ type: "text", nullable: true })
	reason?: string; // 사유 (수동 부여 시)

	@Column({ default: false })
	isRevoked!: boolean; // 취소 여부

	@CreateDateColumn()
	createdAt!: Date;

	// 관계
	@ManyToOne("StudyGroup", { onDelete: "CASCADE" })
	@JoinColumn({ name: "groupId" })
	studyGroup!: Relation<any>;

	@ManyToOne("User")
	@JoinColumn({ name: "studentId" })
	user!: Relation<any>;
}
