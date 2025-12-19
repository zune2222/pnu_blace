import type { Meta, StoryObj } from "@storybook/react";
import { StreakHeatmap } from "./streak-heatmap";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const meta: Meta<typeof StreakHeatmap> = {
  title: "Features/Dashboard/StreakHeatmap",
  component: StreakHeatmap,
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
type Story = StoryObj<typeof StreakHeatmap>;

export const Default: Story = {
  args: {},
};
