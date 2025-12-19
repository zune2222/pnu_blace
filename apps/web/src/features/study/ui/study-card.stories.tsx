import type { Meta, StoryObj } from "@storybook/react";
import { StudyCard } from "./study-card";
import { StudyGroupListItem } from "@pnu-blace/types";

const meta: Meta<typeof StudyCard> = {
  title: "Features/Study/StudyCard",
  component: StudyCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StudyCard>;

const baseStudy: StudyGroupListItem = {
  groupId: "1",
  name: "알고리즘 스터디",
  description: "매일 알고리즘 한 문제씩 풀어요",
  visibility: "PUBLIC",
  memberCount: 5,
  maxMembers: 10,
  checkInStartTime: "09:00",
  checkInEndTime: "10:00",
  checkOutMinTime: "17:00",
  tags: ["알고리즘", "코딩테스트", "JAVA"],
  todayAttendanceRate: 80,
  createdAt: "2024-01-01T00:00:00Z",
};

export const Public: Story = {
  args: {
    study: { ...baseStudy },
  },
};

export const Password: Story = {
  args: {
    study: { ...baseStudy, visibility: "PASSWORD", name: "비밀 스터디" },
  },
};

export const Private: Story = {
  args: {
    study: { ...baseStudy, visibility: "PRIVATE", name: "비공개 스터디" },
  },
};

export const NoTags: Story = {
  args: {
    study: { ...baseStudy, tags: [], name: "태그 없는 스터디" },
  },
};

export const ManyTags: Story = {
  args: {
    study: {
      ...baseStudy,
      tags: ["태그1", "태그2", "태그3", "태그4", "태그5"],
      name: "태그 많은 스터디",
    },
  },
};

export const NoDescription: Story = {
  args: {
    study: { ...baseStudy, description: undefined, name: "설명 없는 스터디" },
  },
};

export const NoMaxMembers: Story = {
  args: {
    study: { ...baseStudy, maxMembers: undefined, name: "인원 무제한" },
  },
};
