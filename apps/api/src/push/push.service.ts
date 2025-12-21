import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DeviceToken } from '@pnu-blace/db';
import * as admin from 'firebase-admin';
import { PushNotificationPayload } from './push.dto';

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private firebaseApp: admin.app.App | null = null;

  constructor(
    @InjectRepository(DeviceToken)
    private deviceTokenRepository: Repository<DeviceToken>,
    private configService: ConfigService,
  ) {}

  onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    const serviceAccountJson = this.configService.get<string>(
      'FIREBASE_SERVICE_ACCOUNT_JSON',
    );

    if (!serviceAccountJson) {
      this.logger.warn(
        'FIREBASE_SERVICE_ACCOUNT_JSON not configured. Push notifications disabled.',
      );
      return;
    }

    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      this.logger.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK:', error);
    }
  }

  /**
   * 디바이스 토큰 등록
   */
  async registerToken(
    studentId: string,
    token: string,
    platform: 'ios' | 'android',
  ): Promise<DeviceToken> {
    // 먼저 토큰으로만 검색 (기존에 다른 studentId로 저장된 경우 대비)
    let deviceToken = await this.deviceTokenRepository.findOne({
      where: { token },
    });

    if (deviceToken) {
      // 기존 레코드 업데이트 (studentId 변경될 수 있음)
      deviceToken.studentId = studentId;
      deviceToken.isActive = true;
      deviceToken.platform = platform;
      deviceToken.updatedAt = new Date();
    } else {
      // 새로 생성
      deviceToken = this.deviceTokenRepository.create({
        studentId,
        token,
        platform,
        isActive: true,
      });
    }

    await this.deviceTokenRepository.save(deviceToken);
    this.logger.log(`Token saved to DB: studentId=${studentId}, tokenPrefix=${token?.slice(0, 20)}, platform=${platform}`);
    this.logger.debug(`Token registered for user ${studentId}`);

    return deviceToken;
  }

  /**
   * 디바이스 토큰 해제 (로그아웃 시)
   */
  async unregisterToken(studentId: string, token: string): Promise<void> {
    await this.deviceTokenRepository.update(
      { studentId, token },
      { isActive: false },
    );
    this.logger.debug(`Token unregistered for user ${studentId}`);
  }

  /**
   * 사용자의 모든 토큰 해제
   */
  async unregisterAllTokens(studentId: string): Promise<void> {
    await this.deviceTokenRepository.update({ studentId }, { isActive: false });
  }

  /**
   * 특정 사용자에게 푸시 알림 발송
   */
  async sendToUser(
    studentId: string,
    notification: PushNotificationPayload,
  ): Promise<boolean> {
    this.logger.log(`sendToUser called for studentId: ${studentId}`);
    
    if (!this.firebaseApp) {
      this.logger.warn('Firebase not initialized, skipping push notification');
      return false;
    }

    const tokens = await this.deviceTokenRepository.find({
      where: { studentId, isActive: true },
    });

    this.logger.log(`Found ${tokens.length} active tokens for user ${studentId}`);

    if (tokens.length === 0) {
      this.logger.warn(`No active tokens for user ${studentId}`);
      return false;
    }

    const tokenStrings = tokens.map((t) => t.token);
    this.logger.log(`Sending to tokens: ${tokenStrings.map(t => t.slice(0, 20) + '...').join(', ')}`);
    
    return this.sendToTokens(tokenStrings, notification);
  }

  async sendToUsers(
    studentIds: string[],
    notification: PushNotificationPayload,
  ): Promise<boolean> {
    if (!this.firebaseApp) {
      this.logger.warn('Firebase not initialized, skipping push notification');
      return false;
    }

    const tokens = await this.deviceTokenRepository.find({
      where: { studentId: In(studentIds), isActive: true },
    });

    if (tokens.length === 0) {
      this.logger.debug('No active tokens for specified users');
      return false;
    }

    const tokenStrings = tokens.map((t) => t.token);
    return this.sendToTokens(tokenStrings, notification);
  }

  /**
   * 특정 사용자 제외하고 발송 (채팅 알림용 - 본인 제외)
   */
  async sendToUsersExcept(
    studentIds: string[],
    excludeStudentId: string,
    notification: PushNotificationPayload,
  ): Promise<boolean> {
    const filteredIds = studentIds.filter((id) => id !== excludeStudentId);
    if (filteredIds.length === 0) return false;
    return this.sendToUsers(filteredIds, notification);
  }

  /**
   * 토큰 목록에 직접 발송
   */
  private async sendToTokens(
    tokens: string[],
    notification: PushNotificationPayload,
  ): Promise<boolean> {
    if (!this.firebaseApp || tokens.length === 0) return false;

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: notification.data,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      this.logger.log(
        `Push sent: ${response.successCount} success, ${response.failureCount} failed`,
      );

      // 실패한 토큰 처리 (만료된 토큰 비활성화)
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const errorCode = resp.error?.code;
            // 만료되거나 유효하지 않은 토큰 비활성화
            if (
              errorCode === 'messaging/invalid-registration-token' ||
              errorCode === 'messaging/registration-token-not-registered'
            ) {
              failedTokens.push(tokens[idx]);
            }
          }
        });

        if (failedTokens.length > 0) {
          this.logger.log(`Deactivating ${failedTokens.length} invalid tokens`);
          await this.deviceTokenRepository.update(
            { token: In(failedTokens) },
            { isActive: false },
          );
        }
      }

      return response.successCount > 0;
    } catch (error) {
      this.logger.error('Failed to send push notification:', error);
      return false;
    }
  }

  /**
   * 사용자의 활성 토큰 수 조회
   */
  async getActiveTokenCount(studentId: string): Promise<number> {
    return this.deviceTokenRepository.count({
      where: { studentId, isActive: true },
    });
  }
}
