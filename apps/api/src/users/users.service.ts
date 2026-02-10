import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@pnu-blace/db';
import { UserProfileDto, UserInfoFromAPI } from '@pnu-blace/types';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * 사용자 프로필 정보 조회
   */
  async getProfile(studentId: string): Promise<UserProfileDto> {
    const user = await this.userRepository.findOne({
      where: { studentId },
    });

    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    return {
      studentId: user.studentId,
      name: user.name,
      major: user.major,
    };
  }

  /**
   * 사용자 정보 업데이트
   */
  async updateProfile(
    studentId: string,
    updateData: Partial<Pick<User, 'name' | 'major'>>,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { studentId },
    });

    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    if (updateData.name) user.name = updateData.name;
    if (updateData.major) user.major = updateData.major;

    return this.userRepository.save(user);
  }

  /**
   * API에서 받은 사용자 정보를 DB에 저장/업데이트
   */
  async saveUserFromAPI(userInfo: UserInfoFromAPI): Promise<User> {
    try {
      // 기존 사용자 조회
      let user = await this.userRepository.findOne({
        where: { studentId: userInfo.userID },
      });

      if (user) {
        // 기존 사용자 업데이트
        user.name = userInfo.userName;
        user.major = userInfo.deptName; // 학과 정보를 major 필드에 저장
        user.lastLoginAt = new Date();

        this.logger.debug(
          `Updating existing user: ${userInfo.userName} (${userInfo.userID})`,
        );
      } else {
        // 새 사용자 생성
        user = this.userRepository.create({
          studentId: userInfo.userID,
          name: userInfo.userName,
          major: userInfo.deptName,
          lastLoginAt: new Date(),
        });

        this.logger.debug(
          `Creating new user: ${userInfo.userName} (${userInfo.userID})`,
        );
      }

      const savedUser = await this.userRepository.save(user);
      this.logger.debug(`User saved successfully: ${savedUser.studentId}`);

      return savedUser;
    } catch (error) {
      this.logger.error(
        `Failed to save user from API: ${this.getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  /**
   * 학번으로 사용자 조회 (없으면 null 반환)
   */
  async findByStudentId(studentId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { studentId },
    });
  }


  /**
   * 에러 메시지 안전하게 추출
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  /**
   * 알림 설정 업데이트
   */
  async updateNotificationSettings(
    studentId: string,
    settings: { studyChatNotification?: boolean; roomChatNotification?: boolean },
  ): Promise<void> {
    await this.userRepository.update(
      { studentId },
      {
        ...(settings.studyChatNotification !== undefined && {
          studyChatNotification: settings.studyChatNotification,
        }),
        ...(settings.roomChatNotification !== undefined && {
          roomChatNotification: settings.roomChatNotification,
        }),
      },
    );
    this.logger.debug(`Notification settings updated for user ${studentId}`);
  }
}
