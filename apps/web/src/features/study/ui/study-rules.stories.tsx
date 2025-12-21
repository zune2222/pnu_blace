import type { Meta, StoryObj } from "@storybook/react";
import { StudyRules } from "./study-rules";

const meta: Meta<typeof StudyRules> = {
  title: "Features/Study/StudyRules",
  component: StudyRules,
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
type Story = StoryObj<typeof StudyRules>;

export const Weekdays: Story = {
  args: {
    operatingDays: [1, 2, 3, 4, 5],
    checkInStartTime: "09:00",
    checkInEndTime: "10:00",
    checkOutMinTime: "17:00",
    minUsageMinutes: 240,
  },
};

export const Weekend: Story = {
  args: {
    operatingDays: [6, 7],
    checkInStartTime: "10:00",
    checkInEndTime: "12:00",
    checkOutMinTime: "15:00",
    minUsageMinutes: 180,
  },
};

export const AllWeek: Story = {
  args: {
    operatingDays: [1, 2, 3, 4, 5, 6, 7],
    checkInStartTime: "08:00",
    checkInEndTime: "09:00",
    checkOutMinTime: "18:00",
    minUsageMinutes: 300,
  },
};
