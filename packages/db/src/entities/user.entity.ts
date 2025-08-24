import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { MyUsageLog } from "./my-usage-log.entity";
import { NotificationRequest } from "./notification-request.entity";

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

	@OneToMany(() => MyUsageLog, (log) => log.user)
	usageLogs!: MyUsageLog[];

	@OneToMany(() => NotificationRequest, (request) => request.user)
	notificationRequests!: NotificationRequest[];
}
