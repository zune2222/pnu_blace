import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { SeatReservationService } from './seat-reservation.service';
import { SchoolApiService } from '../school-api/school-api.service';
import { User, MyUsageLog } from '@pnu-blace/db';

describe('SeatReservationService', () => {
  let service: SeatReservationService;
  let mockUserRepository: any;
  let mockUsageLogRepository: any;
  let mockSchoolApiService: any;

  // 테스트용 Mock 데이터
  const mockUser = {
    studentId: '20230001',
    name: '테스트유저',
    schoolSessionId: 'test-session-id',
    schoolSessionExpiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30분 후
  };

  const mockMySeat = {
    roomNo: '1',
    seatNo: '42',
    startTime: '2024-01-01T10:00:00',
    endTime: '2024-01-01T14:00:00',
  };

  const mockRoomInfo = {
    roomNo: '1',
    roomName: '제1열람실',
  };

  beforeEach(async () => {
    // Mock 객체 생성
    mockUserRepository = {
      findOne: jest.fn(),
    };

    mockUsageLogRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    mockSchoolApiService = {
      getMySeat: jest.fn(),
      getRoomInfo: jest.fn(),
      reserveSeat: jest.fn(),
      returnSeat: jest.fn(),
      extendSeat: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeatReservationService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(MyUsageLog),
          useValue: mockUsageLogRepository,
        },
        {
          provide: SchoolApiService,
          useValue: mockSchoolApiService,
        },
      ],
    }).compile();

    service = module.get<SeatReservationService>(SeatReservationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMySeat', () => {
    it('성공: 예약된 좌석 정보를 반환해야 함', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockSchoolApiService.getMySeat.mockResolvedValue(mockMySeat);
      mockSchoolApiService.getRoomInfo.mockResolvedValue(mockRoomInfo);

      const result = await service.getMySeat('20230001');

      expect(result).toEqual({
        ...mockMySeat,
        roomName: '제1열람실',
        seatDisplayName: '42번',
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { studentId: '20230001' },
      });
    });

    it('실패: 사용자가 존재하지 않으면 NotFoundException 발생', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getMySeat('99999999')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getMySeat('99999999')).rejects.toThrow(
        '사용자를 찾을 수 없습니다.',
      );
    });

    it('실패: 세션이 없으면 BadRequestException 발생', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        schoolSessionId: null,
      });

      await expect(service.getMySeat('20230001')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getMySeat('20230001')).rejects.toThrow(
        '학교 계정 세션이 없습니다. 다시 로그인해주세요.',
      );
    });

    it('성공: 발권한 좌석이 없으면 null 반환', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockSchoolApiService.getMySeat.mockResolvedValue(null);

      const result = await service.getMySeat('20230001');
      expect(result).toBeNull();
    });
  });

  describe('reserveSeat', () => {
    const reserveDto = { roomNo: '1', seatNo: '42' };

    it('성공: 좌석을 예약하고 성공 응답 반환', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockSchoolApiService.getMySeat.mockRejectedValue(
        new NotFoundException('발권한 좌석이 없습니다.'),
      );
      mockSchoolApiService.reserveSeat.mockResolvedValue({
        success: true,
        message: '좌석이 성공적으로 발권되었습니다.',
      });
      mockUsageLogRepository.create.mockReturnValue({
        studentId: '20230001',
        roomNo: '1',
        seatNo: '42',
        startTime: expect.any(Date),
      });
      mockUsageLogRepository.save.mockResolvedValue({});

      const result = await service.reserveSeat('20230001', reserveDto);

      expect(result.success).toBe(true);
      expect(result.message).toContain('성공');
      expect(mockUsageLogRepository.create).toHaveBeenCalled();
      expect(mockUsageLogRepository.save).toHaveBeenCalled();
    });

    it('실패: 이미 예약한 좌석이 있으면 ConflictException 발생', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockSchoolApiService.getMySeat.mockResolvedValue(mockMySeat);
      mockSchoolApiService.getRoomInfo.mockResolvedValue(mockRoomInfo);

      await expect(
        service.reserveSeat('20230001', reserveDto),
      ).rejects.toThrow(ConflictException);
    });

    it('실패: 세션이 만료되면 BadRequestException 발생', async () => {
      const expiredUser = {
        ...mockUser,
        schoolSessionExpiresAt: new Date(Date.now() - 1000), // 만료됨
      };
      mockUserRepository.findOne.mockResolvedValue(expiredUser);
      mockSchoolApiService.getMySeat.mockRejectedValue(
        new NotFoundException('발권한 좌석이 없습니다.'),
      );

      await expect(
        service.reserveSeat('20230001', reserveDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('실패: 학교 API 예약 실패 시 BadRequestException 발생', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockSchoolApiService.getMySeat.mockRejectedValue(
        new NotFoundException('발권한 좌석이 없습니다.'),
      );
      mockSchoolApiService.reserveSeat.mockResolvedValue({
        success: false,
        message: '이미 사용 중인 좌석입니다.',
      });

      await expect(
        service.reserveSeat('20230001', reserveDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.reserveSeat('20230001', reserveDto),
      ).rejects.toThrow('이미 사용 중인 좌석입니다.');
    });
  });

  describe('returnSeat', () => {
    it('성공: 좌석을 반납하고 성공 응답 반환', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockSchoolApiService.getMySeat.mockResolvedValue(mockMySeat);
      mockSchoolApiService.getRoomInfo.mockResolvedValue(mockRoomInfo);
      mockSchoolApiService.returnSeat.mockResolvedValue({
        success: true,
        message: '좌석이 성공적으로 반납되었습니다.',
      });
      mockUsageLogRepository.findOne.mockResolvedValue({
        studentId: '20230001',
        roomNo: '1',
        seatNo: '42',
        startTime: new Date(),
        endTime: null,
      });
      mockUsageLogRepository.save.mockResolvedValue({});

      const result = await service.returnSeat('20230001');

      expect(result.success).toBe(true);
      expect(result.message).toContain('반납');
    });

    it('실패: 예약한 좌석이 없으면 NotFoundException 발생', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockSchoolApiService.getMySeat.mockResolvedValue(null);

      await expect(service.returnSeat('20230001')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('실패: 학교 API 반납 실패 시 BadRequestException 발생', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockSchoolApiService.getMySeat.mockResolvedValue(mockMySeat);
      mockSchoolApiService.getRoomInfo.mockResolvedValue(mockRoomInfo);
      mockSchoolApiService.returnSeat.mockResolvedValue({
        success: false,
        message: '반납에 실패했습니다.',
      });

      await expect(service.returnSeat('20230001')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('extendSeat', () => {
    it('성공: 좌석을 연장하고 성공 응답 반환', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockSchoolApiService.getMySeat.mockResolvedValue(mockMySeat);
      mockSchoolApiService.getRoomInfo.mockResolvedValue(mockRoomInfo);
      mockSchoolApiService.extendSeat.mockResolvedValue({
        success: true,
        message: '좌석이 성공적으로 연장되었습니다.',
      });

      const result = await service.extendSeat('20230001');

      expect(result.success).toBe(true);
      expect(result.endTime).toBeDefined();
      expect(result.message).toContain('연장');
    });

    it('실패: 예약한 좌석이 없으면 NotFoundException 발생', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockSchoolApiService.getMySeat.mockResolvedValue(null);

      await expect(service.extendSeat('20230001')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('실패: 학교 API 연장 실패 시 BadRequestException 발생', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockSchoolApiService.getMySeat.mockResolvedValue(mockMySeat);
      mockSchoolApiService.getRoomInfo.mockResolvedValue(mockRoomInfo);
      mockSchoolApiService.extendSeat.mockResolvedValue({
        success: false,
        message: '연장 가능 시간이 아닙니다.',
      });

      await expect(service.extendSeat('20230001')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
