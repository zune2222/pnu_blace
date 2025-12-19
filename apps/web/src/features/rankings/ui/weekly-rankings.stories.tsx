import type { Meta, StoryObj } from "@storybook/react";
import { WeeklyRankings } from "./weekly-rankings";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const meta: Meta<typeof WeeklyRankings> = {
  title: "Features/Rankings/WeeklyRankings",
  component: WeeklyRankings,
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
type Story = StoryObj<typeof WeeklyRankings>;

export const Default: Story = {
  args: { myNickname: null },
};

export const WithMyNickname: Story = {
  args: { myNickname: "김철수" },
};
