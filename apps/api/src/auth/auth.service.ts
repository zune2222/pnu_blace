import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@pnu-blace/db';
import { SchoolApiService } from '../school-api/school-api.service';
import { UsersService } from '../users/users.service';
import { LoginRequestDto, LoginResponse } from '@pnu-blace/types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private schoolApiService: SchoolApiService,
    private usersService: UsersService,
  ) {}

  /**
   * 사용자 로그인 - 학교 API 인증 후 JWT 발급
   */
  async login(loginRequestDto: LoginRequestDto): Promise<LoginResponse> {
    const { studentId, password } = loginRequestDto;

    try {
      // 1. 학교 API로 인증 시도
      this.logger.debug(`Attempting login for student: ${studentId}`);
      const loginResult = await this.schoolApiService.login(
        studentId,
        password,
      );

      if (!loginResult.success) {
        throw new UnauthorizedException(
          loginResult.errorMessage || '로그인에 실패했습니다.',
        );
      }

      // 2. 학교 API에서 사용자 정보 조회
      this.logger.debug(`Fetching user info for: ${studentId}`);
      const userInfo = await this.schoolApiService.getUserInfo(
        loginResult.sessionID!,
        studentId,
      );

      let user: User;
      if (userInfo) {
        // 학교 API에서 가져온 정보로 사용자 저장/업데이트
        user = await this.usersService.saveUserFromAPI(userInfo);
        this.logger.debug(`User info saved from API: ${userInfo.userName}`);
      } else {
        // 사용자 정보 조회 실패 시 로그인 응답의 정보를 사용
        this.logger.warn(
          `Failed to fetch user info for ${studentId}, using login response info`,
        );

        let existingUser = await this.usersService.findByStudentId(studentId);
        if (!existingUser) {
          existingUser = this.userRepository.create({
            studentId,
            name: loginResult.userName || studentId,
            major: '정보 없음',
            lastLoginAt: new Date(),
          });
          user = await this.userRepository.save(existingUser);
        } else {
          if (loginResult.userName) {
            existingUser.name = loginResult.userName;
          }
          existingUser.lastLoginAt = new Date();
          user = await this.userRepository.save(existingUser);
        }
      }

      // 3. 학교 API 세션 정보 저장
      user.schoolSessionId = loginResult.sessionID;
      user.schoolSessionExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30분 후 만료

      await this.userRepository.save(user);
      this.logger.debug(`School API session saved for: ${studentId}`);

      // 4. JWT 토큰 생성
      const payload = { sub: user.studentId };
      const accessToken = this.jwtService.sign(payload);

      this.logger.debug(`JWT token generated for: ${studentId}`);

      return { accessToken };
    } catch (error) {
      this.logger.error(`Login failed for ${studentId}: ${error.message}`);

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('로그인 처리 중 오류가 발생했습니다.');
    }
  }

  /**
   * JWT 토큰 검증
   */
  async validateUser(studentId: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { studentId },
    });

    return user;
  }
}
