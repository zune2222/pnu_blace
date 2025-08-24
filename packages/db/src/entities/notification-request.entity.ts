import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
	CreateDateColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity()
export class NotificationRequest {
	@PrimaryGeneratedColumn()
	requestId!: number;

	@Column()
	roomNo!: string;

	@Column()
	setNo!: string;

	@Column({
		type: "varchar",
		length: 20,
		default: "PENDING",
	})
	status!: "PENDING" | "COMPLETED" | "CANCELED";

	@Column({ default: false })
	autoReserve!: boolean;

	@Column()
	studentId!: string;

	@CreateDateColumn()
	createdAt!: Date;

	@ManyToOne(() => User, (user) => user.notificationRequests)
	@JoinColumn({ name: "studentId" })
	user!: User;
}
