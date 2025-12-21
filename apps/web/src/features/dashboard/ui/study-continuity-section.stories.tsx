import type { Meta, StoryObj } from "@storybook/react";
import { StudyContinuitySection } from "./study-continuity-section";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const meta: Meta<typeof StudyContinuitySection> = {
  title: "Features/Dashboard/StudyContinuitySection",
  component: StudyContinuitySection,
  tags: ["autodocs"],
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
type Story = StoryObj<typeof StudyContinuitySection>;

export const Default: Story = {
  args: {
    streakStats: {
      currentStreak: 15,
      longestStreak: 30,
      streakStartDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    isLoading: false,
  },
};

export const NewUser: Story = {
  args: {
    streakStats: { currentStreak: 0, longestStreak: 0 },
    isLoading: false,
  },
};

export const DayOne: Story = {
  args: {
    streakStats: {
      currentStreak: 1,
      longestStreak: 1,
      streakStartDate: new Date().toISOString(),
    },
    isLoading: false,
  },
};

export const Loading: Story = {
  args: { isLoading: true, streakStats: null },
};

export const Error: Story = {
  args: { error: "데이터 로드 실패", streakStats: null, isLoading: false },
};
