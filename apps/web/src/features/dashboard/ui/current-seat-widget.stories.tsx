import type { Meta, StoryObj } from '@storybook/react';
import { CurrentSeatWidget } from './current-seat-widget';

const meta: Meta<typeof CurrentSeatWidget> = {
  title: 'Features/Dashboard/CurrentSeatWidget',
  component: CurrentSeatWidget,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CurrentSeatWidget>;

// Mock 데이터
const mockCurrentSeat = {
  roomNo: 'room1',
  roomName: '제1열람실',
  seatNo: '045',
  seatDisplayName: '45번',
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3시간 후
  remainingMinutes: 180,
  status: 'active' as const,
};

export const WithSeat: Story = {
  args: {
    currentSeat: mockCurrentSeat,
    isLoading: false,
    error: null,
    cancelReservation: async () => console.log('취소'),
    extendReservation: async () => console.log('연장'),
    isExtending: false,
    isCancelling: false,
  },
  name: '좌석 이용 중',
};

export const NoSeat: Story = {
  args: {
    currentSeat: null,
    isLoading: false,
    error: null,
    cancelReservation: async () => {},
    extendReservation: async () => {},
    isExtending: false,
    isCancelling: false,
  },
  name: '좌석 없음',
};

export const Loading: Story = {
  args: {
    currentSeat: null,
    isLoading: true,
    error: null,
    cancelReservation: async () => {},
    extendReservation: async () => {},
    isExtending: false,
    isCancelling: false,
  },
  name: '로딩 중',
};

export const Error: Story = {
  args: {
    currentSeat: null,
    isLoading: false,
    error: '좌석 정보를 불러오는데 실패했습니다.',
    cancelReservation: async () => {},
    extendReservation: async () => {},
    isExtending: false,
    isCancelling: false,
  },
  name: '에러 상태',
};

export const Extending: Story = {
  args: {
    currentSeat: mockCurrentSeat,
    isLoading: false,
    error: null,
    cancelReservation: async () => {},
    extendReservation: async () => {},
    isExtending: true,
    isCancelling: false,
  },
  name: '연장 중',
};

export const Cancelling: Story = {
  args: {
    currentSeat: mockCurrentSeat,
    isLoading: false,
    error: null,
    cancelReservation: async () => {},
    extendReservation: async () => {},
    isExtending: false,
    isCancelling: true,
  },
  name: '취소 중',
};
