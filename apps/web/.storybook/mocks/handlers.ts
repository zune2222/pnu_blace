import { http, HttpResponse } from 'msw';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Mock 데이터
const mockSeatHistory = {
  totalUsageHours: 156,
  totalUsageDays: 45,
  averageHoursPerDay: 3.5,
  currentStreak: 7,
  maxStreak: 21,
  favoriteRoom: '제1열람실',
};

const mockCurrentSeat = {
  roomNo: 'room1',
  roomName: '제1열람실',
  seatNo: '045',
  seatDisplayName: '45번',
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
  remainingMinutes: 180,
  status: 'active',
};

const mockRankings = {
  users: [
    { rank: 1, studentId: '2020*****', nickname: '열공러', totalHours: 500, badge: 'gold' },
    { rank: 2, studentId: '2021*****', nickname: '도서관지기', totalHours: 480, badge: 'silver' },
    { rank: 3, studentId: '2019*****', nickname: '공부왕', totalHours: 450, badge: 'bronze' },
  ],
  pagination: { page: 1, totalPages: 10 },
};

export const handlers = [
  // Dashboard API
  http.get(`${API_BASE}/api/v1/dashboard/seat-history`, () => {
    return HttpResponse.json(mockSeatHistory);
  }),

  http.get(`${API_BASE}/api/v1/dashboard/current-seat`, () => {
    return HttpResponse.json(mockCurrentSeat);
  }),

  http.get(`${API_BASE}/api/v1/dashboard/streak-heatmap`, () => {
    return HttpResponse.json({
      data: Array.from({ length: 365 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        hours: Math.floor(Math.random() * 8),
      })),
    });
  }),

  // Rankings API
  http.get(`${API_BASE}/api/v1/rankings/all-time`, () => {
    return HttpResponse.json(mockRankings);
  }),

  http.get(`${API_BASE}/api/v1/rankings/weekly`, () => {
    return HttpResponse.json(mockRankings);
  }),

  http.get(`${API_BASE}/api/v1/rankings/my-rank`, () => {
    return HttpResponse.json({
      rank: 42,
      totalHours: 156,
      percentile: 85,
    });
  }),

  // Seat Finder API
  http.get(`${API_BASE}/api/v1/rooms`, () => {
    return HttpResponse.json([
      { roomNo: 'room1', roomName: '제1열람실', totalSeats: 100, availableSeats: 45 },
      { roomNo: 'room2', roomName: '제2열람실', totalSeats: 80, availableSeats: 20 },
      { roomNo: 'room3', roomName: '노트북열람실', totalSeats: 50, availableSeats: 5 },
    ]);
  }),

  // Auth API
  http.get(`${API_BASE}/api/v1/auth/me`, () => {
    return HttpResponse.json({
      studentId: '202012345',
      name: '홍길동',
      isAuthenticated: true,
    });
  }),
];
