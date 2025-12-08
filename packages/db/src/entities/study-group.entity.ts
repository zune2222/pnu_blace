import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
	ManyToOne,
	JoinColumn,
	Relation,
	Index,
} from "typeorm";

export type StudyVisibility = "PUBLIC" | "PASSWORD" | "PRIVATE";

@Entity()
@Index("idx_study_group_visibility", ["visibility"])
@Index("idx_study_group_invite_code", ["inviteCode"], { unique: true })
export class StudyGroup {
	@PrimaryGeneratedColumn("uuid")
	groupId!: string;

	@Column({ length: 100 })
	name!: string;

	@Column({ type: "text", nullable: true })
	description?: string;

	// 공개 설정
	@Column({ type: "varchar", length: 20, default: "PUBLIC" })
	visibility!: StudyVisibility;

	@Column({ nullable: true })
	password?: string; // bcrypt 해시

	@Column({ length: 8, unique: true })
	inviteCode!: string;

	// 추가 정보 (비로그인 열람용)
	@Column({ nullable: true })
	thumbnailUrl?: string;

	@Column({ type: "simple-array", nullable: true })
	tags?: string[];

	@Column({ type: "int", nullable: true })
	maxMembers?: number;

	// 출퇴근 설정
	@Column({ length: 5, default: "09:00" })
	checkInStartTime!: string; // "08:00"

	@Column({ length: 5, default: "10:00" })
	checkInEndTime!: string; // "10:00"

	@Column({ length: 5, default: "18:00" })
	checkOutMinTime!: string; // 최소 퇴근 시간 "18:00"

	@Column({ type: "int", default: 240 })
	minUsageMinutes!: number; // 최소 이용 시간 (분)

	@Column({ type: "simple-array", default: "1,2,3,4,5" })
	operatingDays!: string[]; // ["1","2","3","4","5"] (월~금)

	// 스터디장
	@Column()
	createdBy!: string; // studentId

	@ManyToOne("User")
	@JoinColumn({ name: "createdBy" })
	creator!: Relation<any>;

	// 멤버 수 (캐싱)
	@Column({ type: "int", default: 1 })
	memberCount!: number;

	// 관계
	@OneToMany("StudyMember", "studyGroup")
	members!: Relation<any[]>;

	@OneToMany("JoinRequest", "studyGroup")
	joinRequests!: Relation<any[]>;

	@OneToMany("AttendanceRecord", "studyGroup")
	attendanceRecords!: Relation<any[]>;

	@OneToMany("VacationRequest", "studyGroup")
	vacationRequests!: Relation<any[]>;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
