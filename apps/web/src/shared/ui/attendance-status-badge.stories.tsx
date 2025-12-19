import type { Meta, StoryObj } from "@storybook/react";
import { AttendanceStatusBadge } from "./attendance-status-badge";

const meta: Meta<typeof AttendanceStatusBadge> = {
  title: "Shared/UI/AttendanceStatusBadge",
  component: AttendanceStatusBadge,
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["PRESENT", "LATE", "EARLY_LEAVE", "ABSENT", "VACATION", "NOT_YET"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof AttendanceStatusBadge>;

export const Present: Story = {
  args: { status: "PRESENT" },
};

export const Late: Story = {
  args: { status: "LATE" },
};

export const EarlyLeave: Story = {
  args: { status: "EARLY_LEAVE" },
};

export const Absent: Story = {
  args: { status: "ABSENT" },
};

export const Vacation: Story = {
  args: { status: "VACATION" },
};

export const NotYet: Story = {
  args: { status: "NOT_YET" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <AttendanceStatusBadge status="PRESENT" />
      <AttendanceStatusBadge status="LATE" />
      <AttendanceStatusBadge status="EARLY_LEAVE" />
      <AttendanceStatusBadge status="ABSENT" />
      <AttendanceStatusBadge status="VACATION" />
      <AttendanceStatusBadge status="NOT_YET" />
    </div>
  ),
};
