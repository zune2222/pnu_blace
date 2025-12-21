import type { Meta, StoryObj } from "@storybook/react";
import { StudyOverallStats } from "./study-overall-stats";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const meta: Meta<typeof StudyOverallStats> = {
  title: "Features/Study/StudyOverallStats",
  component: StudyOverallStats,
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
type Story = StoryObj<typeof StudyOverallStats>;

export const Default: Story = {
  args: {
    groupId: "test-group-id",
  },
};
