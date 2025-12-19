import type { Meta, StoryObj } from "@storybook/react";
import { AllTimeRankings } from "./all-time-rankings";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const meta: Meta<typeof AllTimeRankings> = {
  title: "Features/Rankings/AllTimeRankings",
  component: AllTimeRankings,
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
type Story = StoryObj<typeof AllTimeRankings>;

export const Default: Story = {
  args: { myNickname: null },
};

export const WithMyNickname: Story = {
  args: { myNickname: "홍길동" },
};
