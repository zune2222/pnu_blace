import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  useSeatHistory, 
  useStreakHeatmap, 
  useMyRank,
  usePersonalStats,
  useSeatHistoryTable,
} from './hooks';

// Mock the API module
vi.mock('../api', () => ({
  dashboardApi: {
    getSeatHistory: vi.fn(),
    getStreakHeatmap: vi.fn(),
    getMyRank: vi.fn(),
    getPersonalStats: vi.fn(),
    getSeatHistoryTable: vi.fn(),
  },
}));

import { dashboardApi } from '../api';

// Helper to create a fresh QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

// Wrapper component for React Query
const createWrapper = () => {
  const queryClient = createTestQueryClient();
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
};

describe('Dashboard Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useSeatHistory', () => {
    it('returns loading state initially', () => {
      vi.mocked(dashboardApi.getSeatHistory).mockResolvedValue(null);
      
      const { result } = renderHook(() => useSeatHistory(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('returns data on success', async () => {
      const mockData = {
        totalHours: 120.5,
        studyDays: 45,
        currentStreak: 7,
        longestStreak: 14,
      };
      vi.mocked(dashboardApi.getSeatHistory).mockResolvedValue(mockData);

      const { result } = renderHook(() => useSeatHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
    });

    it('returns null on empty response', async () => {
      vi.mocked(dashboardApi.getSeatHistory).mockResolvedValue(null);

      const { result } = renderHook(() => useSeatHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeNull();
    });
  });

  describe('useStreakHeatmap', () => {
    it('fetches and returns heatmap data', async () => {
      const mockData = {
        days: [
          { date: '2024-01-01', count: 3 },
          { date: '2024-01-02', count: 5 },
        ],
        currentStreak: 7,
      };
      vi.mocked(dashboardApi.getStreakHeatmap).mockResolvedValue(mockData);

      const { result } = renderHook(() => useStreakHeatmap(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useMyRank', () => {
    it('fetches and returns rank data', async () => {
      const mockData = {
        weeklyRank: 15,
        weeklyHours: 25.5,
        allTimeRank: 42,
        allTimeHours: 500.0,
      };
      vi.mocked(dashboardApi.getMyRank).mockResolvedValue(mockData);

      const { result } = renderHook(() => useMyRank(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('usePersonalStats', () => {
    it('fetches and returns personal stats', async () => {
      const mockData = {
        totalStudyHours: 150.0,
        averageHoursPerDay: 3.5,
        favoriteRoom: '제1열람실',
      };
      vi.mocked(dashboardApi.getPersonalStats).mockResolvedValue(mockData);

      const { result } = renderHook(() => usePersonalStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useSeatHistoryTable', () => {
    it('fetches with default page 1', async () => {
      const mockData = {
        items: [],
        pagination: { page: 1, totalPages: 5 },
      };
      vi.mocked(dashboardApi.getSeatHistoryTable).mockResolvedValue(mockData);

      const { result } = renderHook(() => useSeatHistoryTable(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(dashboardApi.getSeatHistoryTable).toHaveBeenCalledWith(1, 10, undefined, undefined);
    });

    it('fetches with custom page and date range', async () => {
      const mockData = {
        items: [],
        pagination: { page: 2, totalPages: 5 },
      };
      vi.mocked(dashboardApi.getSeatHistoryTable).mockResolvedValue(mockData);

      const { result } = renderHook(
        () => useSeatHistoryTable(2, '2024-01-01', '2024-01-31'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(dashboardApi.getSeatHistoryTable).toHaveBeenCalledWith(2, 10, '2024-01-01', '2024-01-31');
    });
  });
});
