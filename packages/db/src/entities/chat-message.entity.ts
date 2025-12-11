import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	ManyToOne,
	JoinColumn,
	Relation,
	Index,
} from "typeorm";

@Entity()
@Index("idx_chat_message_group", ["groupId"])
@Index("idx_chat_message_created", ["createdAt"])
export class ChatMessage {
	@PrimaryGeneratedColumn("uuid")
	messageId!: string;

	@Column()
	groupId!: string; // 스터디 그룹 ID

	@Column()
	studentId!: string; // 발신자 학번

	@Column({ length: 50 })
	displayName!: string; // 발신자 닉네임 (스터디 내)

	@Column({ type: "text" })
	content!: string; // 메시지 내용

	@Column({ default: false })
	isDeleted!: boolean; // 삭제 여부

	@Column({ default: false })
	isSystem!: boolean; // 시스템 메시지 여부

	@CreateDateColumn()
	createdAt!: Date;

	// 관계
	@ManyToOne("StudyGroup", { onDelete: "CASCADE" })
	@JoinColumn({ name: "groupId" })
	studyGroup!: Relation<any>;

	@ManyToOne("User")
	@JoinColumn({ name: "studentId" })
	user!: Relation<any>;
}
