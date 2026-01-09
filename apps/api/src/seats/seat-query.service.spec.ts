import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { SeatQueryService } from './seat-query.service';
import { SchoolApiService } from '../school-api/school-api.service';
import { User } from '@pnu-blace/db';

describe('SeatQueryService', () => {
  let service: SeatQueryService;
  let mockUserRepository: any;
  let mockSchoolApiService: any;

  const mockUser = {
    studentId: '20230001',
    name: '테스트유저',
    schoolSessionId: 'test-session-id',
    schoolSessionExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
  };

  const mockSeats = [
    { seatNo: '1', status: 'AVAILABLE' },
    { seatNo: '2', status: 'OCCUPIED' },
    { seatNo: '3', status: 'UNAVAILABLE' },
    { seatNo: '4', status: 'AVAILABLE' },
  ];

  const mockRoomInfo = {
    roomNo: '1',
    roomName: '제1열람실',
  };

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
    };

    mockSchoolApiService = {
      getSeatMap: jest.fn(),
      getRoomInfo: jest.fn(),
      getBackgroundImageUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeatQueryService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: SchoolApiService,
          useValue: mockSchoolApiService,
        },
      ],
    }).compile();

    service = module.get<SeatQueryService>(SeatQueryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSeatStatus', () => {
    it('성공: 좌석 상태 목록을 반환해야 함', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockSchoolApiService.getSeatMap.mockResolvedValue(mockSeats);

      const result = await service.getSeatStatus('1', '20230001');

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({ seatNo: '1', status: 'AVAILABLE' });
      expect(result[1]).toEqual({ seatNo: '2', status: 'OCCUPIED' });
    });

    it('실패: 사용자가 없으면 BadRequestException 발생', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getSeatStatus('1', '99999999')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('실패: 세션이 만료되면 BadRequestException 발생', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        schoolSessionExpiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.getSeatStatus('1', '20230001')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getSeatDetail', () => {
    it('성공: 좌석 상세 정보를 반환해야 함', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockSchoolApiService.getSeatMap.mockResolvedValue(mockSeats);
      mockSchoolApiService.getRoomInfo.mockResolvedValue(mockRoomInfo);
      mockSchoolApiService.getBackgroundImageUrl.mockReturnValue(
        'https://example.com/bg.png',
      );

      const result = await service.getSeatDetail('1', '20230001');

      expect(result.roomNo).toBe('1');
      expect(result.roomName).toBe('제1열람실');
      expect(result.totalSeats).toBe(4);
      expect(result.occupiedSeats).toEqual(['2']);
      expect(result.unavailableSeats).toEqual(['3']);
      expect(result.availableSeats).toEqual(['1', '4']);
      expect(result.backgroundImageUrl).toBe('https://example.com/bg.png');
    });

    it('실패: 세션이 없으면 BadRequestException 발생', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        schoolSessionId: null,
      });

      await expect(service.getSeatDetail('1', '20230001')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getBackgroundImageUrl', () => {
    it('배경 이미지 URL을 반환해야 함', () => {
      mockSchoolApiService.getBackgroundImageUrl.mockReturnValue(
        'https://example.com/room1.png',
      );

      const result = service.getBackgroundImageUrl('1');

      expect(result).toBe('https://example.com/room1.png');
      expect(mockSchoolApiService.getBackgroundImageUrl).toHaveBeenCalledWith(
        '1',
      );
    });
  });
});
