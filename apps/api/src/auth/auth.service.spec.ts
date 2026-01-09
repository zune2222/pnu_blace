import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SchoolApiService } from '../school-api/school-api.service';
import { UsersService } from '../users/users.service';
import { User } from '@pnu-blace/db';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: any;
  let mockJwtService: any;
  let mockSchoolApiService: any;
  let mockUsersService: any;

  const mockUser = {
    studentId: '20230001',
    name: '테스트유저',
    major: '컴퓨터공학과',
    schoolSessionId: null,
    schoolSessionExpiresAt: null,
    lastLoginAt: new Date(),
  };

  const mockLoginResult = {
    success: true,
    sessionID: 'test-session-id',
  };

  const mockUserInfo = {
    userID: '20230001',
    userName: '테스트유저',
    deptName: '컴퓨터공학과',
  };

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    mockSchoolApiService = {
      login: jest.fn(),
      getUserInfo: jest.fn(),
    };

    mockUsersService = {
      saveUserFromAPI: jest.fn(),
      findByStudentId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: SchoolApiService,
          useValue: mockSchoolApiService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto = { studentId: '20230001', password: 'password123' };

    it('성공: 학교 API 인증 후 JWT 토큰 반환', async () => {
      mockSchoolApiService.login.mockResolvedValue(mockLoginResult);
      mockSchoolApiService.getUserInfo.mockResolvedValue(mockUserInfo);
      mockUsersService.saveUserFromAPI.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        schoolSessionId: 'test-session-id',
      });

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(mockSchoolApiService.login).toHaveBeenCalledWith(
        '20230001',
        'password123',
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: '20230001' });
    });

    it('성공: 기존 사용자 로그인 시 세션 업데이트', async () => {
      mockSchoolApiService.login.mockResolvedValue(mockLoginResult);
      mockSchoolApiService.getUserInfo.mockResolvedValue(mockUserInfo);
      mockUsersService.saveUserFromAPI.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        schoolSessionId: 'test-session-id',
        schoolSessionExpiresAt: expect.any(Date),
      });

      await service.login(loginDto);

      expect(mockUserRepository.save).toHaveBeenCalled();
      const savedUser = mockUserRepository.save.mock.calls[0][0];
      expect(savedUser.schoolSessionId).toBe('test-session-id');
    });

    it('실패: 학교 API 인증 실패 시 UnauthorizedException 발생', async () => {
      mockSchoolApiService.login.mockResolvedValue({
        success: false,
        errorMessage: '아이디 또는 비밀번호가 일치하지 않습니다.',
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        '아이디 또는 비밀번호가 일치하지 않습니다.',
      );
    });

    it('실패: 학교 API 오류 발생 시 UnauthorizedException 발생', async () => {
      mockSchoolApiService.login.mockRejectedValue(new Error('Network error'));

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        '로그인 처리 중 오류가 발생했습니다.',
      );
    });

    it('성공: 사용자 정보 조회 실패 시 기본 정보로 저장', async () => {
      mockSchoolApiService.login.mockResolvedValue(mockLoginResult);
      mockSchoolApiService.getUserInfo.mockResolvedValue(null);
      mockUsersService.findByStudentId.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        studentId: '20230001',
        name: '20230001',
        major: '정보 없음',
      });
      mockUserRepository.save.mockResolvedValue({
        studentId: '20230001',
        name: '20230001',
        major: '정보 없음',
        schoolSessionId: 'test-session-id',
      });

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(mockUserRepository.create).toHaveBeenCalled();
    });

    it('성공: 사용자 정보 조회 실패 + 기존 사용자 존재 시 업데이트', async () => {
      const existingUser = { ...mockUser };
      mockSchoolApiService.login.mockResolvedValue(mockLoginResult);
      mockSchoolApiService.getUserInfo.mockResolvedValue(null);
      mockUsersService.findByStudentId.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue({
        ...existingUser,
        lastLoginAt: expect.any(Date),
        schoolSessionId: 'test-session-id',
      });

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('성공: 사용자 존재 시 User 반환', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser('20230001');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { studentId: '20230001' },
      });
    });

    it('성공: 사용자 미존재 시 null 반환', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser('99999999');

      expect(result).toBeNull();
    });
  });
});
