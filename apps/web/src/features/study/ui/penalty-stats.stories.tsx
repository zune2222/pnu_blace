import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PenaltyStats } from "./penalty-stats";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta: Meta<typeof PenaltyStats> = {
  title: "Features/Study/PenaltyStats",
  component: PenaltyStats,
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
type Story = StoryObj<typeof PenaltyStats>;

export const Default: Story = {
  args: {
    groupId: "mock-group-id",
  },
};
