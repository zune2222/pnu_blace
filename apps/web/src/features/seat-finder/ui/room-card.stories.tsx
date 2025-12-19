import type { Meta, StoryObj } from "@storybook/react";
import { RoomCard } from "./room-card";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const meta: Meta<typeof RoomCard> = {
  title: "Features/SeatFinder/RoomCard",
  component: RoomCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="max-w-md bg-background p-4">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RoomCard>;

export const Available: Story = {
  args: {
    room: {
      roomNo: "001",
      roomName: "제1열람실",
      timeStart: "06:00",
      timeEnd: "23:00",
      totalSeat: 100,
      useSeat: 55,
      remainSeat: 45,
      useRate: 55,
    },
    onSelect: (room) => console.log("Selected:", room),
  },
};

export const AlmostFull: Story = {
  args: {
    room: {
      roomNo: "002",
      roomName: "제2열람실",
      timeStart: "06:00",
      timeEnd: "23:00",
      totalSeat: 80,
      useSeat: 75,
      remainSeat: 5,
      useRate: 94,
    },
  },
};

export const Full: Story = {
  args: {
    room: {
      roomNo: "003",
      roomName: "노트북열람실",
      timeStart: "09:00",
      timeEnd: "21:00",
      totalSeat: 50,
      useSeat: 50,
      remainSeat: 0,
      useRate: 100,
    },
  },
};

export const Empty: Story = {
  args: {
    room: {
      roomNo: "004",
      roomName: "대학원열람실",
      timeStart: "00:00",
      timeEnd: "24:00",
      totalSeat: 30,
      useSeat: 0,
      remainSeat: 30,
      useRate: 0,
    },
  },
};

