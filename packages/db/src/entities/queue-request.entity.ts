import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
	CreateDateColumn,
	UpdateDateColumn,
	Relation,
} from "typeorm";

@Entity()
export class QueueRequest {
	@PrimaryGeneratedColumn()
	queueId!: number;

	@Column()
	studentId!: string;

	@Column({
		type: "varchar",
		length: 30,
		comment: "요청 타입 (SEAT_RESERVATION, EMPTY_SEAT_RESERVATION)",
	})
	requestType!: "SEAT_RESERVATION" | "EMPTY_SEAT_RESERVATION";

	@Column({
		type: "varchar",
		length: 20,
		default: "WAITING",
		comment: "큐 상태",
	})
	status!: "WAITING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELED";

	@Column({ nullable: true })
	roomNo?: string;

	@Column({ nullable: true })
	seatNo?: string;

	@Column({ type: "int", default: 0, comment: "대기 순서 (0부터 시작)" })
	queuePosition!: number;

	@Column({ type: "int", default: 0, comment: "우선순위 (낮을수록 우선)" })
	priority!: number;

	@Column({
		type: "text",
		nullable: true,
		comment: "추가 요청 데이터 (JSON 형태)",
	})
	requestData?: string;

	@Column({
		default: false,
		comment: "현재 좌석이 있을 때 자동 반납 후 예약할지 여부",
	})
	autoReturnCurrent!: boolean;

	@Column({ type: "timestamp", nullable: true })
	scheduledAt?: Date;

	@Column({ type: "timestamp", nullable: true })
	processedAt?: Date;

	@Column({ type: "text", nullable: true })
	errorMessage?: string;

	@Column({ type: "int", default: 0, comment: "재시도 횟수" })
	retryCount!: number;

	@Column({ type: "int", default: 240, comment: "최대 재시도 횟수" })
	maxRetries!: number;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@ManyToOne("User", "queueRequests")
	@JoinColumn({ name: "studentId" })
	user!: Relation<any>;
}
