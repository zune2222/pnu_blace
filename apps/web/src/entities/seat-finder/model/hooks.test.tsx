import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSeatDetail, useSeatPrediction, useReserveSeatMutation } from './hooks';

// Mock dependencies
vi.mock('../api', () => ({
  seatFinderApi: {
    getSeatDetail: vi.fn(),
    getSeatPrediction: vi.fn(),
    reserveSeat: vi.fn(),
  },
}));

vi.mock('@/entities/auth', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/shared/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn() },
}));

vi.mock('@/shared/lib/error-utils', () => ({
  getSeatReservationErrorMessage: (err: unknown) => (err as Error)?.message || '예약 실패',
  isExpectedApiError: () => false,
}));

import { seatFinderApi } from '../api';
import { toast } from 'sonner';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Seat Finder Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useSeatDetail', () => {
    it('does not fetch when roomNo is empty', () => {
      const { result } = renderHook(() => useSeatDetail(''), {
        wrapper: createWrapper(),
      });
      expect(result.current.isFetching).toBe(false);
    });

    it('fetches seat details when roomNo provided', async () => {
      const mockData = {
        roomNo: 'room1',
        roomName: '제1열람실',
        totalSeats: 100,
        occupiedSeats: 45,
        availableSeats: 55,
        seats: [],
      };
      vi.mocked(seatFinderApi.getSeatDetail).mockResolvedValue(mockData);

      const { result } = renderHook(() => useSeatDetail('room1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(seatFinderApi.getSeatDetail).toHaveBeenCalledWith('room1');
      expect(result.current.data?.roomName).toBe('제1열람실');
      expect(result.current.data?.availableSeats).toBe(55);
    });

    it('handles null response', async () => {
      vi.mocked(seatFinderApi.getSeatDetail).mockResolvedValue(null);

      const { result } = renderHook(() => useSeatDetail('room1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toBeNull();
    });
  });

  describe('useSeatPrediction', () => {
    it('does not fetch when disabled', () => {
      const { result } = renderHook(
        () => useSeatPrediction('room1', '001', false),
        { wrapper: createWrapper() }
      );
      expect(result.current.isFetching).toBe(false);
    });

    it('does not fetch when roomNo is empty', () => {
      const { result } = renderHook(
        () => useSeatPrediction('', '001', true),
        { wrapper: createWrapper() }
      );
      expect(result.current.isFetching).toBe(false);
    });

    it('fetches prediction when enabled with valid params', async () => {
      const mockData = {
        roomNo: 'room1',
        seatNo: '001',
        analysis: '오후 2시경 빈 자리가 생길 확률이 높습니다',
      };
      vi.mocked(seatFinderApi.getSeatPrediction).mockResolvedValue(mockData);

      const { result } = renderHook(
        () => useSeatPrediction('room1', '001', true),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(seatFinderApi.getSeatPrediction).toHaveBeenCalledWith('room1', '001');
      expect(result.current.data?.analysis).toContain('오후');
    });
  });

  describe('useReserveSeatMutation', () => {
    it('calls reserveSeat API with request object', async () => {
      const mockResponse = {
        success: true,
        message: '예약 완료',
        requiresGateEntry: false,
      };
      vi.mocked(seatFinderApi.reserveSeat).mockResolvedValue(mockResponse);

      const onSuccess = vi.fn();
      const { result } = renderHook(
        () => useReserveSeatMutation('room1', onSuccess),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        result.current.mutate({ seatNo: '001' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(seatFinderApi.reserveSeat).toHaveBeenCalledWith({
        roomNo: 'room1',
        seatNo: '001',
        autoExtensionEnabled: undefined,
      });
      expect(onSuccess).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });

    it('handles reservation with autoExtension', async () => {
      const mockResponse = {
        success: true,
        message: '예약 완료',
        requiresGateEntry: true,
      };
      vi.mocked(seatFinderApi.reserveSeat).mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useReserveSeatMutation('room1'),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        result.current.mutate({ seatNo: '001', autoExtensionEnabled: true });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(seatFinderApi.reserveSeat).toHaveBeenCalledWith({
        roomNo: 'room1',
        seatNo: '001',
        autoExtensionEnabled: true,
      });
    });

    it('shows gate entry message when required', async () => {
      const mockResponse = {
        success: true,
        message: '예약 완료',
        requiresGateEntry: true,
      };
      vi.mocked(seatFinderApi.reserveSeat).mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useReserveSeatMutation('room1'),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        result.current.mutate({ seatNo: '001' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(toast.success).toHaveBeenCalledWith(
        '좌석이 성공적으로 발권되었습니다!',
        expect.objectContaining({
          description: expect.stringContaining('출입게이트'),
        })
      );
    });

    it('handles reservation error', async () => {
      vi.mocked(seatFinderApi.reserveSeat).mockRejectedValue(
        new Error('이미 예약된 좌석입니다')
      );

      const { result } = renderHook(
        () => useReserveSeatMutation('room1'),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        result.current.mutate({ seatNo: '001' });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalled();
    });
  });
});
