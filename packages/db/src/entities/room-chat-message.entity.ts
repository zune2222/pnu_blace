import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	Index,
} from "typeorm";

@Entity()
@Index("idx_room_chat_room_created", ["roomNo", "createdAt"])
export class RoomChatMessage {
	@PrimaryGeneratedColumn("uuid")
	messageId!: string;

	@Column()
	roomNo!: string; // 열람실 번호 (E10-1 등)

	@Column()
	studentId!: string; // 발신자 학번 (익명 처리됨)

	@Column({ length: 50 })
	anonymousName!: string; // 일일 익명 닉네임

	@Column({ type: "text" })
	content!: string; // 메시지 내용

	@CreateDateColumn()
	createdAt!: Date;
}
