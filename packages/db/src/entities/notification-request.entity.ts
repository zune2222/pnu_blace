import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
	CreateDateColumn,
	Relation,
} from "typeorm";

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

	@ManyToOne("User", "notificationRequests")
	@JoinColumn({ name: "studentId" })
	user!: Relation<any>;
}
