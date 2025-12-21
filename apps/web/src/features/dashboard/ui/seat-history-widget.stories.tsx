import type { Meta, StoryObj } from "@storybook/react";
import { SeatHistoryWidget } from "./seat-history-widget";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const meta: Meta<typeof SeatHistoryWidget> = {
  title: "Features/Dashboard/SeatHistoryWidget",
  component: SeatHistoryWidget,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="p-4 bg-background max-w-md">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SeatHistoryWidget>;

export const Default: Story = {};
