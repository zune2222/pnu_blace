import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ChatMessage, StudyMember } from '@pnu-blace/db';

export interface ChatMessageDto {
  messageId: string;
  groupId: string;
  studentId: string;
  displayName: string;
  content: string;
  createdAt: string;
  isSystem: boolean;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(StudyMember)
    private studyMemberRepository: Repository<StudyMember>,
  ) {}

  /**
   * 메시지 저장
   */
  async saveMessage(
    groupId: string,
    studentId: string,
    content: string,
  ): Promise<ChatMessageDto> {
    // 멤버 정보로 displayName 조회
    const member = await this.studyMemberRepository.findOne({
      where: { groupId, studentId },
    });

    this.logger.debug(`Saving message for studentId: ${studentId}, groupId: ${groupId}`);
    this.logger.debug(`Member found: ${JSON.stringify(member)}`);

    if (!member) {
      throw new Error('스터디 멤버가 아닙니다.');
    }

    const message = this.chatMessageRepository.create({
      groupId,
      studentId,
      displayName: member.displayName || `멤버${studentId.slice(-4)}`,
      content,
    });

    this.logger.debug(`Message displayName: ${member.displayName}`);

    const saved = await this.chatMessageRepository.save(message);

    return this.toDto(saved);
  }

  /**
   * 시스템 메시지 저장
   */
  async saveSystemMessage(groupId: string, content: string): Promise<ChatMessageDto> {
    const message = this.chatMessageRepository.create({
      groupId,
      studentId: 'SYSTEM',
      displayName: '시스템',
      content,
      isSystem: true,
    });

    const saved = await this.chatMessageRepository.save(message);
    return this.toDto(saved);
  }

  /**
   * 채팅 히스토리 조회
   */
  async getMessages(
    groupId: string,
    limit: number = 50,
    before?: string,
  ): Promise<ChatMessageDto[]> {
    const query = this.chatMessageRepository
      .createQueryBuilder('msg')
      .where('msg.groupId = :groupId', { groupId })
      .andWhere('msg.isDeleted = false')
      .orderBy('msg.createdAt', 'DESC')
      .take(limit);

    if (before) {
      const beforeDate = new Date(before);
      query.andWhere('msg.createdAt < :before', { before: beforeDate });
    }

    const messages = await query.getMany();

    // 시간순 정렬 (오래된 순)
    return messages.reverse().map((msg) => this.toDto(msg));
  }

  /**
   * 멤버 권한 확인
   */
  async isMemberOfGroup(groupId: string, studentId: string): Promise<boolean> {
    const member = await this.studyMemberRepository.findOne({
      where: { groupId, studentId },
    });
    return !!member;
  }

  /**
   * 메시지 삭제 (soft delete)
   */
  async deleteMessage(
    messageId: string,
    studentId: string,
  ): Promise<boolean> {
    const message = await this.chatMessageRepository.findOne({
      where: { messageId },
    });

    if (!message || message.studentId !== studentId) {
      return false;
    }

    message.isDeleted = true;
    await this.chatMessageRepository.save(message);
    return true;
  }

  private toDto(message: ChatMessage): ChatMessageDto {
    return {
      messageId: message.messageId,
      groupId: message.groupId,
      studentId: message.studentId,
      displayName: message.displayName,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      isSystem: message.isSystem,
    };
  }
}
