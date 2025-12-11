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
import { Logger, Inject, Optional } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RoomChatService } from './room-chat.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';

interface AuthenticatedSocket extends Socket {
  data: {
    studentId?: string;
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
  namespace: '/room-chat',
})
export class RoomChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RoomChatGateway.name);

  // 방별 접속자 추적
  private roomUsers = new Map<string, Set<string>>();

  constructor(
    private roomChatService: RoomChatService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Optional() @Inject(REDIS_CLIENT) private redisClient: Redis | null,
  ) {}

  /**
   * Gateway 초기화 - Redis Adapter 설정
   */
  afterInit(server: Server) {
    if (this.redisClient) {
      const pubClient = this.redisClient.duplicate();
      const subClient = this.redisClient.duplicate();

      server.adapter(createAdapter(pubClient, subClient));
      this.logger.log('✅ Redis adapter attached to room-chat gateway');
    } else {
      this.logger.warn('⚠️ Redis not available, running without adapter');
    }
  }

  /**
   * 클라이언트 연결
   */
  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
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
      this.logger.debug(
        `Room chat client connected: ${client.id}, studentId: ${payload.sub}`,
      );
    } catch (error) {
      this.logger.debug(`Auth failed for room chat: ${error}`);
      client.disconnect();
    }
  }

  /**
   * 클라이언트 연결 해제
   */
  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.debug(`Room chat client disconnected: ${client.id}`);

    // 모든 방에서 유저 제거
    this.roomUsers.forEach((users, roomNo) => {
      if (client.data.studentId && users.has(client.data.studentId)) {
        users.delete(client.data.studentId);
      }
    });
  }

  /**
   * 열람실 채팅방 입장
   */
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomNo: string },
  ) {
    const { roomNo } = data;
    const studentId = client.data.studentId;

    if (!studentId) {
      return { success: false, error: '인증되지 않은 사용자입니다.' };
    }

    // 방 입장
    client.join(roomNo);

    // 접속자 추적
    if (!this.roomUsers.has(roomNo)) {
      this.roomUsers.set(roomNo, new Set());
    }
    this.roomUsers.get(roomNo)!.add(studentId);

    // 사용자의 일일 닉네임 반환
    const anonymousName = this.roomChatService.generateDailyNickname(studentId);

    this.logger.debug(`User ${studentId} joined room chat ${roomNo}`);

    return { success: true, anonymousName };
  }

  /**
   * 열람실 채팅방 퇴장
   */
  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomNo: string },
  ) {
    const { roomNo } = data;
    const studentId = client.data.studentId;

    client.leave(roomNo);

    if (studentId && this.roomUsers.has(roomNo)) {
      this.roomUsers.get(roomNo)!.delete(studentId);
    }

    return { success: true };
  }

  /**
   * 메시지 전송
   */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomNo: string; content: string },
  ) {
    const { roomNo, content } = data;
    const studentId = client.data.studentId;

    if (!studentId) {
      return { success: false, error: '인증되지 않은 사용자입니다.' };
    }

    if (!content || content.trim().length === 0) {
      return { success: false, error: '메시지 내용이 없습니다.' };
    }

    if (content.length > 200) {
      return { success: false, error: '메시지가 너무 깁니다. (최대 200자)' };
    }

    try {
      const message = await this.roomChatService.saveMessage(
        roomNo,
        studentId,
        content.trim(),
      );

      // 방의 모든 클라이언트에게 메시지 브로드캐스트
      this.server.to(roomNo).emit('newMessage', message);

      return { success: true, message };
    } catch (error: any) {
      this.logger.error(`Failed to save room chat message: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 오늘 채팅 내역 조회
   */
  @SubscribeMessage('getTodayHistory')
  async handleGetTodayHistory(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomNo: string },
  ) {
    const { roomNo } = data;
    const studentId = client.data.studentId;

    if (!studentId) {
      return { success: false, error: '인증되지 않은 사용자입니다.' };
    }

    try {
      const messages = await this.roomChatService.getTodayMessages(roomNo);
      return { success: true, messages };
    } catch (error: any) {
      this.logger.error(`Failed to get room chat history: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
