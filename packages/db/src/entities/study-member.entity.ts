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
}
