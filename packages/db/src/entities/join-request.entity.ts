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

export type JoinRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

@Entity()
@Index("idx_join_request_group", ["groupId"])
@Index("idx_join_request_student", ["studentId"])
@Index("idx_join_request_status", ["status"])
export class JoinRequest {
	@PrimaryGeneratedColumn("uuid")
	requestId!: string;

	@Column()
	groupId!: string;

	@Column()
	studentId!: string;

	// 신청 메시지
	@Column({ type: "text", nullable: true })
	message?: string;

	// 상태
	@Column({ type: "varchar", length: 20, default: "PENDING" })
	status!: JoinRequestStatus;

	// 처리 정보
	@Column({ nullable: true })
	processedBy?: string; // 처리한 사람 studentId

	@Column({ type: "timestamp", nullable: true })
	processedAt?: Date;

	@Column({ type: "text", nullable: true })
	rejectionReason?: string;

	// 관계
	@ManyToOne("StudyGroup", "joinRequests", { onDelete: "CASCADE" })
	@JoinColumn({ name: "groupId" })
	studyGroup!: Relation<any>;

	@ManyToOne("User")
	@JoinColumn({ name: "studentId" })
	user!: Relation<any>;

	@CreateDateColumn()
	createdAt!: Date;
}
