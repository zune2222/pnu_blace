import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class SeatEventLog {
	@PrimaryGeneratedColumn()
	eventId!: number;

	@Column()
	roomNo!: string;

	@Column()
	seatNo!: string;

	@Column({ nullable: true })
	libraryName?: string;

	@Column()
	event!: "OCCUPIED" | "VACATED";

	@Column({ type: "timestamp" })
	timestamp!: Date;

	@Column({
		type: "varchar",
		length: 20,
		default: "NORMAL",
	})
	periodType!: "NORMAL" | "EXAM" | "VACATION" | "FINALS";
}
