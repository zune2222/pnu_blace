import type { Meta, StoryObj } from "@storybook/react";
import { FavoriteRoomsSection } from "./favorite-rooms-section";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const meta: Meta<typeof FavoriteRoomsSection> = {
  title: "Features/Dashboard/FavoriteRoomsSection",
  component: FavoriteRoomsSection,
  tags: ["autodocs"],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="p-4 bg-background">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FavoriteRoomsSection>;

export const Default: Story = {
  args: {
    favoriteRooms: [
      {
        roomNo: "001",
        roomName: "제1열람실",
        location: "중앙도서관 1층",
        seats: [],
        totalSeats: 100,
        availableSeats: 45,
        occupancyRate: 55,
        operatingHours: { open: "06:00", close: "24:00" },
        isOpen: true,
        isFavorite: true,
      },
      {
        roomNo: "002",
        roomName: "제2열람실",
        location: "중앙도서관 2층",
        seats: [],
        totalSeats: 80,
        availableSeats: 10,
        occupancyRate: 88,
        operatingHours: { open: "06:00", close: "24:00" },
        isOpen: true,
        isFavorite: true,
      },
    ],
    isLoading: false,
  },
};

export const Loading: Story = {
  args: { isLoading: true },
};

export const Empty: Story = {
  args: { favoriteRooms: [], isLoading: false },
};

export const Error: Story = {
  args: { error: "즐겨찾기를 불러올 수 없습니다", isLoading: false },
};

