import { Entity, PrimaryColumn, Column, OneToMany, Relation } from "typeorm";

@Entity()
export class User {
	@PrimaryColumn()
	studentId!: string;

	@Column()
	name!: string;

	@Column()
	major!: string;

	@Column({ type: "timestamp", nullable: true })
	lastLoginAt?: Date;

	// 학교 API 세션 정보
	@Column({ nullable: true })
	schoolSessionId?: string;

	@Column({ type: "timestamp", nullable: true })
	schoolSessionExpiresAt?: Date;

	@OneToMany("MyUsageLog", "user")
	usageLogs!: Relation<any[]>;

	@OneToMany("NotificationRequest", "user")
	notificationRequests!: Relation<any[]>;
}
