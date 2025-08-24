import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity()
export class MyUsageLog {
	@PrimaryGeneratedColumn()
	logId!: number;

	@Column()
	roomNo!: string;

	@Column()
	setNo!: string;

	@Column({ type: "timestamp" })
	startTime!: Date;

	@Column({ type: "timestamp", nullable: true })
	endTime?: Date;

	@Column()
	studentId!: string;

	@ManyToOne(() => User, (user) => user.usageLogs)
	@JoinColumn({ name: "studentId" })
	user!: User;
}
