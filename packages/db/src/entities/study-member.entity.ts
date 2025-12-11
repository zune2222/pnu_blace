import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	Relation,
	Index,
	Unique,
} from "typeorm";

export type StudyMemberRole = "OWNER" | "ADMIN" | "MEMBER";

@Entity()
@Unique("uq_study_member", ["groupId", "studentId"])
@Index("idx_study_member_group", ["groupId"])
@Index("idx_study_member_student", ["studentId"])
export class StudyMember {
	@PrimaryGeneratedColumn("uuid")
	memberId!: string;

	@Column()
	groupId!: string;

	@Column()
	studentId!: string;

	// 역할
	@Column({ type: "varchar", length: 20, default: "MEMBER" })
	role!: StudyMemberRole;

	// 스터디 내 닉네임
	@Column({ length: 50 })
	displayName!: string;

	// 관계
	@ManyToOne("StudyGroup", "members", { onDelete: "CASCADE" })
	@JoinColumn({ name: "groupId" })
	studyGroup!: Relation<any>;

	@ManyToOne("User")
	@JoinColumn({ name: "studentId" })
	user!: Relation<any>;

	@CreateDateColumn()
	joinedAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@Column({ type: "timestamp", nullable: true })
	lastActiveAt?: Date;

	// 개별 스터디별 연속성 추적
	@Column({ type: 'int', default: 0 })
	currentStreak!: number; // 이 스터디에서의 현재 연속 출석일

	@Column({ type: 'int', default: 0 })
	longestStreak!: number; // 이 스터디에서의 최고 연속 출석일

	@Column({ type: 'date', nullable: true })
	lastAttendanceDate?: Date; // 마지막 출석일

	@Column({ type: 'date', nullable: true })
	streakStartDate?: Date; // 현재 연속 출석 시작일

	// 벌점 시스템
	@Column({ type: 'int', default: 0 })
	currentPenaltyPoints!: number; // 현재 벌점 (리셋 주기 내)

	@Column({ type: 'int', default: 0 })
	totalPenaltyPoints!: number; // 누적 벌점 (전체 기간)

	@Column({ type: 'timestamp', nullable: true })
	lastPenaltyResetAt?: Date; // 마지막 벌점 리셋 시간
}
