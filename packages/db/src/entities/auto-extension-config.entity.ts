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
export class AutoExtensionConfig {
	@PrimaryGeneratedColumn()
	configId!: number;

	@Column()
	studentId!: string;

	@Column({ default: true })
	isEnabled!: boolean;

	@Column({ type: "int", default: 30, comment: "남은 시간이 이 분 이하일 때 자동 연장 (예: 30분)" })
	triggerMinutesBefore!: number;

	@Column({ type: "int", default: 4, comment: "하루 최대 자동 연장 횟수 (기본 4회)" })
	maxAutoExtensions!: number;

	@Column({ type: "int", default: 0, comment: "오늘 자동 연장된 횟수" })
	currentExtensionCount!: number;

	@Column({ type: "date", nullable: true, comment: "마지막 연장 카운트 리셋 날짜" })
	lastResetDate?: string;

	@Column({ 
		type: "varchar", 
		length: 20, 
		default: "ALL_TIMES", 
		comment: "언제 자동 연장할지 (ALL_TIMES, WEEKDAYS, WEEKENDS)" 
	})
	timeRestriction!: "ALL_TIMES" | "WEEKDAYS" | "WEEKENDS";

	@Column({ 
		type: "time", 
		nullable: true, 
		comment: "자동 연장 시작 시간 (예: 09:00)" 
	})
	startTime?: string;

	@Column({ 
		type: "time", 
		nullable: true, 
		comment: "자동 연장 종료 시간 (예: 22:00)" 
	})
	endTime?: string;

	@Column({ type: "timestamp", nullable: true })
	lastExtendedAt?: Date;

	@Column({ 
		default: false, 
		comment: "빈자리 예약 시 현재 좌석을 자동 반납할지 여부" 
	})
	autoReturnOnEmptyReservation!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@ManyToOne("User", "autoExtensionConfigs")
	@JoinColumn({ name: "studentId" })
	user!: Relation<any>;
}