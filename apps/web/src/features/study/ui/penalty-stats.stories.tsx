import type { Meta, StoryObj } from "@storybook/react";
import { PenaltyStats } from "./penalty-stats";
import { StudyGroupDetail } from "@pnu-blace/types";

const meta: Meta<typeof PenaltyStats> = {
  title: "Features/Study/PenaltyStats",
  component: PenaltyStats,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="p-4 bg-background">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PenaltyStats>;

const mockStudy: StudyGroupDetail = {
  groupId: "1",
  name: "알고리즘 스터디",
  description: "매일 한 문제씩",
  visibility: "PUBLIC",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  memberCount: 3,
  maxMembers: 10,
  operatingDays: [1, 2, 3, 4, 5],
  checkInStartTime: "09:00",
  checkInEndTime: "10:00",
  checkOutMinTime: "17:00",
  minUsageMinutes: 240,
  members: [
    { memberId: "1", displayName: "홍길동", role: "OWNER", joinedAt: "2024-01-01T00:00:00Z" },
    { memberId: "2", displayName: "김철수", role: "MEMBER", joinedAt: "2024-01-02T00:00:00Z" },
    { memberId: "3", displayName: "이영희", role: "MEMBER", joinedAt: "2024-01-03T00:00:00Z" },
  ],
};

export const Default: Story = {
  args: {
    study: mockStudy,
  },
};
