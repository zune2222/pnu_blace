import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  useAllTimeRankings, 
  useWeeklyRankings, 
  useMyRankInfo,
  usePrivacySettings,
} from './hooks';
import type { 
  AllTimeRankingsData, 
  WeeklyRankingsData, 
  MyRankInfo, 
  RankingPrivacySettings,
  RankingUser,
  WeeklyRankingUser,
} from './types';

// Mock the API module
vi.mock('../api', () => ({
  rankingsApi: {
    getAllTimeRankings: vi.fn(),
    getWeeklyRankings: vi.fn(),
    getMyRank: vi.fn(),
    getPrivacySettings: vi.fn(),
    saveNickname: vi.fn(),
    generateRandomNickname: vi.fn(),
  },
}));

import { rankingsApi } from '../api';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Mock data factories
const createMockRankingUser = (overrides: Partial<RankingUser> = {}): RankingUser => ({
  rank: 1,
  publicNickname: '테스트유저',
  totalHours: 100,
  totalSessions: 50,
  totalDays: 30,
  tier: 'Gold',
  ...overrides,
});

const createMockWeeklyRankingUser = (overrides: Partial<WeeklyRankingUser> = {}): WeeklyRankingUser => ({
  rank: 1,
  publicNickname: '주간테스트',
  weeklyHours: 25,
  weeklySessions: 12,
  weeklyDays: 5,
  tier: 'Silver',
  ...overrides,
});

const createMockAllTimeRankingsData = (): AllTimeRankingsData => ({
  hoursRanking: [createMockRankingUser({ rank: 1 }), createMockRankingUser({ rank: 2, publicNickname: '유저2' })],
  sessionsRanking: [createMockRankingUser({ rank: 1 })],
  daysRanking: [createMockRankingUser({ rank: 1 })],
  pagination: {
    page: 1,
    limit: 20,
    totalPages: { hours: 5, sessions: 3, days: 2 },
    totalItems: { hours: 100, sessions: 60, days: 40 },
  },
});

const createMockWeeklyRankingsData = (): WeeklyRankingsData => ({
  weekStart: '2024-01-01',
  weekEnd: '2024-01-07',
  hoursRanking: [createMockWeeklyRankingUser({ rank: 1 })],
  sessionsRanking: [createMockWeeklyRankingUser({ rank: 1 })],
  daysRanking: [createMockWeeklyRankingUser({ rank: 1 })],
  pagination: {
    page: 1,
    limit: 20,
    totalPages: { hours: 3, sessions: 2, days: 1 },
    totalItems: { hours: 50, sessions: 30, days: 15 },
  },
});

describe('Rankings Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAllTimeRankings', () => {
    it('returns loading state initially', () => {
      vi.mocked(rankingsApi.getAllTimeRankings).mockResolvedValue(null);
      
      const { result } = renderHook(() => useAllTimeRankings(1), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('fetches all-time rankings with correct page', async () => {
      const mockData = createMockAllTimeRankingsData();
      vi.mocked(rankingsApi.getAllTimeRankings).mockResolvedValue(mockData);

      const { result } = renderHook(() => useAllTimeRankings(2), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      
      expect(rankingsApi.getAllTimeRankings).toHaveBeenCalledWith(2);
      expect(result.current.data?.hoursRanking).toHaveLength(2);
    });

    it('returns data with correct structure', async () => {
      const mockData = createMockAllTimeRankingsData();
      vi.mocked(rankingsApi.getAllTimeRankings).mockResolvedValue(mockData);

      const { result } = renderHook(() => useAllTimeRankings(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.hoursRanking[0].publicNickname).toBe('테스트유저');
      expect(result.current.data?.pagination.totalPages.hours).toBe(5);
    });
  });

  describe('useWeeklyRankings', () => {
    it('fetches weekly rankings', async () => {
      const mockData = createMockWeeklyRankingsData();
      vi.mocked(rankingsApi.getWeeklyRankings).mockResolvedValue(mockData);

      const { result } = renderHook(() => useWeeklyRankings(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.weekStart).toBe('2024-01-01');
      expect(result.current.data?.hoursRanking[0].publicNickname).toBe('주간테스트');
    });

    it('handles pagination', async () => {
      vi.mocked(rankingsApi.getWeeklyRankings).mockResolvedValue(createMockWeeklyRankingsData());

      const { result } = renderHook(() => useWeeklyRankings(3), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(rankingsApi.getWeeklyRankings).toHaveBeenCalledWith(3);
    });
  });

  describe('useMyRankInfo', () => {
    it('fetches my rank info', async () => {
      const mockData: MyRankInfo = {
        totalUsers: 500,
        hoursRank: 15,
        sessionsRank: 20,
        daysRank: 10,
        hoursPercentile: 97,
        sessionsPercentile: 96,
        daysPercentile: 98,
        tier: 'Platinum',
        publicNickname: '내닉네임',
      };
      vi.mocked(rankingsApi.getMyRank).mockResolvedValue(mockData);

      const { result } = renderHook(() => useMyRankInfo(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.hoursRank).toBe(15);
      expect(result.current.data?.tier).toBe('Platinum');
    });

    it('handles null response', async () => {
      vi.mocked(rankingsApi.getMyRank).mockResolvedValue(null);

      const { result } = renderHook(() => useMyRankInfo(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toBeNull();
    });
  });

  describe('usePrivacySettings', () => {
    it('fetches privacy settings', async () => {
      const mockData: RankingPrivacySettings = {
        isPublicRanking: true,
        publicNickname: '공개닉네임',
      };
      vi.mocked(rankingsApi.getPrivacySettings).mockResolvedValue(mockData);

      const { result } = renderHook(() => usePrivacySettings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.isPublicRanking).toBe(true);
      expect(result.current.data?.publicNickname).toBe('공개닉네임');
    });

    it('handles hidden ranking user', async () => {
      const mockData: RankingPrivacySettings = {
        isPublicRanking: false,
        publicNickname: undefined,
      };
      vi.mocked(rankingsApi.getPrivacySettings).mockResolvedValue(mockData);

      const { result } = renderHook(() => usePrivacySettings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.isPublicRanking).toBe(false);
    });
  });
});
