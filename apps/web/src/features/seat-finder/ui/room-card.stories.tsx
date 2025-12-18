import type { Meta, StoryObj } from '@storybook/react';
import { RoomCard } from './room-card';

const meta: Meta<typeof RoomCard> = {
  title: 'Features/SeatFinder/RoomCard',
  component: RoomCard,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof RoomCard>;

export const Available: Story = {
  args: {
    room: {
      roomNo: 'room1',
      roomName: '제1열람실',
      location: '정보관 4층',
      totalSeats: 100,
      availableSeats: 45,
      occupiedSeats: 55,
    },
  },
};

export const Full: Story = {
  args: {
    room: {
      roomNo: 'room2',
      roomName: '제2열람실',
      location: '정보관 5층',
      totalSeats: 80,
      availableSeats: 0,
      occupiedSeats: 80,
    },
  },
};

export const AlmostFull: Story = {
  args: {
    room: {
      roomNo: 'room3',
      roomName: '노트북열람실',
      location: '정보관 3층',
      totalSeats: 50,
      availableSeats: 5,
      occupiedSeats: 45,
    },
  },
};
