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

	@OneToMany("MyUsageLog", "user")
	usageLogs!: Relation<any[]>;

	@OneToMany("NotificationRequest", "user")
	notificationRequests!: Relation<any[]>;
}
