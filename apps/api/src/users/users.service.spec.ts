import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from '@pnu-blace/db';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepository: any;

  const mockUser = {
    studentId: '20230001',
    name: '테스트유저',
    major: '컴퓨터공학과',
    lastLoginAt: new Date(),
    studyChatNotification: true,
    roomChatNotification: true,
  };

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('성공: 사용자 프로필 정보 반환', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile('20230001');

      expect(result).toEqual({
        studentId: '20230001',
        name: '테스트유저',
        major: '컴퓨터공학과',
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { studentId: '20230001' },
      });
    });

    it('실패: 사용자 미존재 시 Error throw', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getProfile('99999999')).rejects.toThrow(
        '사용자를 찾을 수 없습니다.',
      );
    });
  });

  describe('updateProfile', () => {
    it('성공: 이름 업데이트', async () => {
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser });
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        name: '새이름',
      });

      const result = await service.updateProfile('20230001', { name: '새이름' });

      expect(result.name).toBe('새이름');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('성공: 전공 업데이트', async () => {
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser });
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        major: '정보컴퓨터공학과',
      });

      const result = await service.updateProfile('20230001', {
        major: '정보컴퓨터공학과',
      });

      expect(result.major).toBe('정보컴퓨터공학과');
    });

    it('실패: 사용자 미존재 시 Error throw', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateProfile('99999999', { name: '새이름' }),
      ).rejects.toThrow('사용자를 찾을 수 없습니다.');
    });
  });

  describe('saveUserFromAPI', () => {
    const userInfoFromAPI = {
      userID: '20230001',
      userName: '테스트유저',
      deptName: '컴퓨터공학과',
      patName: '학부생',
      qrCode: 'test-qr-code',
      photoUrl: 'https://example.com/photo.jpg',
      mainNoti: '',
    };

    it('성공: 신규 사용자 생성', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        studentId: '20230001',
        name: '테스트유저',
        major: '컴퓨터공학과',
        lastLoginAt: expect.any(Date),
      });
      mockUserRepository.save.mockResolvedValue({
        studentId: '20230001',
        name: '테스트유저',
        major: '컴퓨터공학과',
      });

      const result = await service.saveUserFromAPI(userInfoFromAPI);

      expect(result.studentId).toBe('20230001');
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('성공: 기존 사용자 업데이트', async () => {
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser });
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        name: '테스트유저',
        major: '컴퓨터공학과',
        lastLoginAt: expect.any(Date),
      });

      const result = await service.saveUserFromAPI(userInfoFromAPI);

      expect(result.studentId).toBe('20230001');
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('findByStudentId', () => {
    it('성공: 사용자 반환', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByStudentId('20230001');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { studentId: '20230001' },
      });
    });

    it('성공: 미존재 시 null 반환', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findByStudentId('99999999');

      expect(result).toBeNull();
    });
  });

  describe('updateNotificationSettings', () => {
    it('성공: 스터디 채팅 알림 설정 업데이트', async () => {
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateNotificationSettings('20230001', {
        studyChatNotification: false,
      });

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { studentId: '20230001' },
        { studyChatNotification: false },
      );
    });

    it('성공: 열람실 채팅 알림 설정 업데이트', async () => {
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateNotificationSettings('20230001', {
        roomChatNotification: false,
      });

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { studentId: '20230001' },
        { roomChatNotification: false },
      );
    });

    it('성공: 모든 알림 설정 동시 업데이트', async () => {
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateNotificationSettings('20230001', {
        studyChatNotification: true,
        roomChatNotification: false,
      });

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { studentId: '20230001' },
        { studyChatNotification: true, roomChatNotification: false },
      );
    });
  });
});
