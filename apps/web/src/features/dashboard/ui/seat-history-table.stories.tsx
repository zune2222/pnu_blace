import type { Meta, StoryObj } from "@storybook/react";
import { SeatHistoryTable } from "./seat-history-table";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const meta: Meta<typeof SeatHistoryTable> = {
  title: "Features/Dashboard/SeatHistoryTable",
  component: SeatHistoryTable,
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
type Story = StoryObj<typeof SeatHistoryTable>;

export const Default: Story = {
  args: {},
};
