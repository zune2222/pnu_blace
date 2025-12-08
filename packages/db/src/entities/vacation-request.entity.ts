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

export type VacationStatus = "PENDING" | "APPROVED" | "REJECTED";

@Entity()
@Index("idx_vacation_group", ["groupId"])
@Index("idx_vacation_student", ["studentId"])
@Index("idx_vacation_dates", ["startDate", "endDate"])
export class VacationRequest {
	@PrimaryGeneratedColumn("uuid")
	requestId!: string;

	@Column()
	groupId!: string;

	@Column()
	studentId!: string;

	// 휴가 기간
	@Column({ type: "date" })
	startDate!: Date;

	@Column({ type: "date" })
	endDate!: Date;

	// 사유
	@Column({ type: "text", nullable: true })
	reason?: string;

	// 상태
	@Column({ type: "varchar", length: 20, default: "PENDING" })
	status!: VacationStatus;

	// 처리 정보
	@Column({ nullable: true })
	processedBy?: string;

	@Column({ type: "timestamp", nullable: true })
	processedAt?: Date;

	// 관계
	@ManyToOne("StudyGroup", "vacationRequests", { onDelete: "CASCADE" })
	@JoinColumn({ name: "groupId" })
	studyGroup!: Relation<any>;

	@ManyToOne("User")
	@JoinColumn({ name: "studentId" })
	user!: Relation<any>;

	@CreateDateColumn()
	createdAt!: Date;
}
