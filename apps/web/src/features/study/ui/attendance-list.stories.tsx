import type { Meta, StoryObj } from "@storybook/react";
import { AttendanceList } from "./attendance-list";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const meta: Meta<typeof AttendanceList> = {
  title: "Features/Study/AttendanceList",
  component: AttendanceList,
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
type Story = StoryObj<typeof AttendanceList>;

export const Default: Story = {
  args: {
    groupId: "test-group-id",
    attendance: [
      { memberId: "1", displayName: "홍길동", status: "PRESENT", checkInTime: "09:00", usageMinutes: 120 },
      { memberId: "2", displayName: "김철수", status: "LATE", checkInTime: "09:30", usageMinutes: 90 },
      { memberId: "3", displayName: "이영희", status: "ABSENT" },
    ],
  },
};

export const Loading: Story = {
  args: {
    groupId: "test-group-id",
    attendance: [],
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    groupId: "test-group-id",
    attendance: [],
  },
};

