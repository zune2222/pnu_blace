import type { Meta, StoryObj } from "@storybook/react";
import { DailyAttendanceViewer } from "./daily-attendance-viewer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const meta: Meta<typeof DailyAttendanceViewer> = {
  title: "Features/Study/DailyAttendanceViewer",
  component: DailyAttendanceViewer,
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
type Story = StoryObj<typeof DailyAttendanceViewer>;

export const Default: Story = {
  args: { groupId: "test-group" },
};
