import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService, ChatMessageDto } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PushService } from '../push/push.service';

interface AuthenticatedSocket extends Socket {
  data: {
    studentId?: string;
    sessionId?: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'https://pnu-blace.vercel.app',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);
  
  // 방별 접속자 추적
  private roomUsers = new Map<string, Set<string>>();

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private pushService: PushService,
  ) {}

  /**
   * Gateway 초기화
   * Note: Redis Adapter는 main.ts에서 커스텀 IoAdapter를 통해 설정됩니다.
   */
  afterInit() {
    this.logger.log('✅ ChatGateway initialized');
  }

  /**
   * 클라이언트 연결
   */
  async handleConnection(client: AuthenticatedSocket) {
    try {
      // JWT 토큰 인증
      const token = client.handshake.auth?.token || 
                    client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.debug('No token provided, disconnecting client');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      client.data.studentId = payload.sub;
      this.logger.debug(`Client connected: ${client.id}, studentId: ${payload.sub}`);
    } catch (error) {
      this.logger.debug(`Auth failed: ${error}`);
      client.disconnect();
    }
  }

  /**
   * 클라이언트 연결 해제
   */
  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
    
    // 모든 방에서 유저 제거
    this.roomUsers.forEach((users, roomId) => {
      if (client.data.studentId && users.has(client.data.studentId)) {
        users.delete(client.data.studentId);
        // 방에 남은 유저수 브로드캐스트
        this.server.to(roomId).emit('userCount', { roomId, count: users.size });
      }
    });
  }

  /**
   * 채팅방 입장
   */
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { groupId: string },
  ) {
    const { groupId } = data;
    const studentId = client.data.studentId;

    if (!studentId) {
      return { success: false, error: '인증되지 않은 사용자입니다.' };
    }

    // 멤버 권한 확인
    const isMember = await this.chatService.isMemberOfGroup(groupId, studentId);
    if (!isMember) {
      return { success: false, error: '스터디 멤버가 아닙니다.' };
    }

    // 방 입장
    client.join(groupId);

    // 접속자 추적
    if (!this.roomUsers.has(groupId)) {
      this.roomUsers.set(groupId, new Set());
    }
    this.roomUsers.get(groupId)!.add(studentId);

    // 채팅 히스토리 로드
    const messages = await this.chatService.getMessages(groupId, 50);

    // 현재 접속자 수 브로드캐스트
    this.server.to(groupId).emit('userCount', {
      roomId: groupId,
      count: this.roomUsers.get(groupId)!.size,
    });

    this.logger.debug(`User ${studentId} joined room ${groupId}`);

    return { success: true, messages };
  }

  /**
   * 채팅방 퇴장
   */
  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { groupId: string },
  ) {
    const { groupId } = data;
    const studentId = client.data.studentId;

    client.leave(groupId);

    if (studentId && this.roomUsers.has(groupId)) {
      this.roomUsers.get(groupId)!.delete(studentId);
      this.server.to(groupId).emit('userCount', {
        roomId: groupId,
        count: this.roomUsers.get(groupId)!.size,
      });
    }

    return { success: true };
  }

  /**
   * 메시지 전송
   */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { groupId: string; content: string },
  ) {
    const { groupId, content } = data;
    const studentId = client.data.studentId;

    if (!studentId) {
      return { success: false, error: '인증되지 않은 사용자입니다.' };
    }

    if (!content || content.trim().length === 0) {
      return { success: false, error: '메시지 내용이 없습니다.' };
    }

    if (content.length > 1000) {
      return { success: false, error: '메시지가 너무 깁니다. (최대 1000자)' };
    }

    try {
      const message = await this.chatService.saveMessage(
        groupId,
        studentId,
        content.trim(),
      );

      // 방의 모든 클라이언트에게 메시지 브로드캐스트
      this.server.to(groupId).emit('newMessage', message);

      // 현재 접속해있지 않은 멤버들에게 푸시 알림 발송
      this.sendPushToOfflineMembers(groupId, studentId, message);

      return { success: true, message };
    } catch (error: any) {
      this.logger.error(`Failed to save message: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 오프라인 멤버에게 푸시 알림 발송
   */
  private async sendPushToOfflineMembers(
    groupId: string,
    senderStudentId: string,
    message: ChatMessageDto,
  ) {
    try {
      // 그룹의 모든 멤버 조회
      const allMemberIds = await this.chatService.getGroupMemberIds(groupId);
      
      // 현재 채팅방에 접속해있는 멤버 제외
      const onlineUsers = this.roomUsers.get(groupId) || new Set();
      const offlineMemberIds = allMemberIds.filter(
        (id) => !onlineUsers.has(id) && id !== senderStudentId,
      );

      if (offlineMemberIds.length === 0) {
        return;
      }

      // 푸시 알림 발송
      await this.pushService.sendToUsers(offlineMemberIds, {
        title: `${message.displayName}`,
        body: message.content.length > 50 
          ? message.content.substring(0, 50) + '...' 
          : message.content,
        data: {
          type: 'STUDY_CHAT',
          groupId: groupId,
          route: `/study/${groupId}`,
        },
      });

      this.logger.debug(`Push sent to ${offlineMemberIds.length} offline members`);
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error}`);
    }
  }

  /**
   * 이전 메시지 로드 (무한 스크롤용)
   */
  @SubscribeMessage('loadMore')
  async handleLoadMore(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { groupId: string; before: string },
  ) {
    const { groupId, before } = data;
    const studentId = client.data.studentId;

    if (!studentId) {
      return { success: false, error: '인증되지 않은 사용자입니다.' };
    }

    const messages = await this.chatService.getMessages(groupId, 50, before);
    return { success: true, messages };
  }
}
