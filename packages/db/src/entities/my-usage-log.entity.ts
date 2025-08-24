import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
	Relation,
} from "typeorm";

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

	@ManyToOne("User", "usageLogs")
	@JoinColumn({ name: "studentId" })
	user!: Relation<any>;
}
