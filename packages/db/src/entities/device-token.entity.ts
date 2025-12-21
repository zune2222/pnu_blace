import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	Unique,
	Index,
	type Relation,
} from "typeorm";

@Entity("device_tokens")
@Unique(["studentId", "token"])
@Index(["studentId"])
export class DeviceToken {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	studentId!: string;

	@Column()
	token!: string; // FCM token

	@Column({
		type: "varchar",
		length: 10,
	})
	platform!: "ios" | "android";

	@Column({ default: true })
	isActive!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@ManyToOne("User", "deviceTokens")
	@JoinColumn({ name: "studentId" })
	user!: Relation<any>;
}
