import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { RoomChatMessage } from '@pnu-blace/db';

// 익명 닉네임 생성용 단어 목록
const ADJECTIVES = [
  '용감한', '졸린', '배고픈', '행복한', '열정적인', '차분한', '호기심많은',
  '느긋한', '부지런한', '산뜻한', '영리한', '재빠른', '친절한', '명랑한',
  '신중한', '활발한', '겸손한', '대담한', '유쾌한', '꾸준한'
];

const ANIMALS = [
  '펭귄', '고양이', '토끼', '강아지', '여우', '곰', '사자', '호랑이',
  '판다', '코알라', '기린', '수달', '물개', '햄스터', '다람쥐', '올빼미',
  '독수리', '돌고래', '거북이', '앵무새'
];

export interface RoomChatMessageDto {
  messageId: string;
  roomNo: string;
  anonymousName: string;
  content: string;
  createdAt: string;
}

@Injectable()
export class RoomChatService {
  private readonly logger = new Logger(RoomChatService.name);

  constructor(
    @InjectRepository(RoomChatMessage)
    private roomChatMessageRepository: Repository<RoomChatMessage>,
  ) {}

  /**
   * 일일 익명 닉네임 생성
   * userId + 오늘 날짜를 해시하여 일관된 닉네임 생성
   */
  generateDailyNickname(userId: string): string {
    const today = new Date().toISOString().split('T')[0]; // "2025-12-12"
    const hash = this.hashCode(`${userId}-${today}`);
    const adjective = ADJECTIVES[Math.abs(hash) % ADJECTIVES.length];
    const animal = ANIMALS[Math.abs(hash >> 8) % ANIMALS.length];
    return `${adjective} ${animal}`;
  }

  /**
   * 메시지 저장
   */
  async saveMessage(
    roomNo: string,
    studentId: string,
    content: string,
  ): Promise<RoomChatMessageDto> {
    const anonymousName = this.generateDailyNickname(studentId);

    const message = this.roomChatMessageRepository.create({
      roomNo,
      studentId,
      anonymousName,
      content,
    });

    const saved = await this.roomChatMessageRepository.save(message);
    this.logger.debug(`Message saved: ${saved.messageId} in room ${roomNo}`);

    return this.toDto(saved);
  }

  /**
   * 채팅 내역 조회 (페이징)
   */
  async getMessages(
    roomNo: string,
    before?: Date,
    limit: number = 50,
  ): Promise<RoomChatMessageDto[]> {
    const queryBuilder = this.roomChatMessageRepository
      .createQueryBuilder('message')
      .where('message.roomNo = :roomNo', { roomNo })
      .orderBy('message.createdAt', 'DESC')
      .take(limit);

    if (before) {
      queryBuilder.andWhere('message.createdAt < :before', { before });
    }

    const messages = await queryBuilder.getMany();

    // 과거 -> 최신 순으로 정렬하여 반환
    return messages.reverse().map((msg) => this.toDto(msg));
  }

  /**
   * 간단한 해시 함수 (djb2)
   */
  private hashCode(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) + hash + str.charCodeAt(i);
    }
    return hash;
  }

  private toDto(message: RoomChatMessage): RoomChatMessageDto {
    return {
      messageId: message.messageId,
      roomNo: message.roomNo,
      anonymousName: message.anonymousName,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    };
  }
}
