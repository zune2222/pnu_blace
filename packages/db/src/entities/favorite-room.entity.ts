import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
	Relation,
} from "typeorm";
import { User } from "./user.entity";

@Entity()
export class FavoriteRoom {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	studentId!: string;

	@Column()
	roomNo!: string;

	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	createdAt!: Date;

	@Column({
		type: "timestamp",
		default: () => "CURRENT_TIMESTAMP",
		onUpdate: "CURRENT_TIMESTAMP",
	})
	updatedAt!: Date;

	// 사용자와의 관계
	@ManyToOne(() => User, { onDelete: "CASCADE" })
	@JoinColumn({ name: "studentId" })
	user!: Relation<User>;
}
