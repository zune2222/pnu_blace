import type { Meta, StoryObj } from "@storybook/react";
import { StreakSummaryCard } from "./streak-summary-card";

const meta: Meta<typeof StreakSummaryCard> = {
  title: "Features/Dashboard/StreakSummaryCard",
  component: StreakSummaryCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-md p-4 bg-background">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StreakSummaryCard>;

export const Loading: Story = {
  args: {
    isLoading: true,
    streakStats: null,
  },
};

export const NoStreak: Story = {
  args: {
    isLoading: false,
    streakStats: {
      currentStreak: 0,
      longestStreak: 5,
    },
  },
};

export const OneDay: Story = {
  args: {
    isLoading: false,
    streakStats: {
      currentStreak: 1,
      longestStreak: 10,
    },
  },
};

export const ShortStreak: Story = {
  args: {
    isLoading: false,
    streakStats: {
      currentStreak: 5,
      longestStreak: 15,
    },
  },
};

export const LongStreak: Story = {
  args: {
    isLoading: false,
    streakStats: {
      currentStreak: 25,
      longestStreak: 50,
    },
  },
};

export const AmazingStreak: Story = {
  args: {
    isLoading: false,
    streakStats: {
      currentStreak: 42,
      longestStreak: 42,
    },
  },
};

export const Error: Story = {
  args: {
    isLoading: false,
    streakStats: null,
    error: "네트워크 오류",
  },
};
