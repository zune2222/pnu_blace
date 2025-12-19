import type { Meta, StoryObj } from "@storybook/react";
import { SeatInfoDisplay } from "./seat-info-display";

const meta: Meta<typeof SeatInfoDisplay> = {
  title: "Features/Dashboard/SeatInfoDisplay",
  component: SeatInfoDisplay,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="p-8 bg-background">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SeatInfoDisplay>;

export const Default: Story = {
  args: {
    roomName: "제1열람실 A구역",
    seatDisplayName: "A-27번 좌석",
    remainingMinutes: 180,
    remainingSeconds: 45,
    statusBadge: {
      color: "green",
      text: "ACTIVE",
      bgClass: "bg-green-500/10 text-green-600",
    },
  },
};

export const LowTime: Story = {
  args: {
    roomName: "노트북열람실",
    seatDisplayName: "B-15번 좌석",
    remainingMinutes: 15,
    remainingSeconds: 30,
    statusBadge: {
      color: "amber",
      text: "WARNING",
      bgClass: "bg-amber-500/10 text-amber-600",
    },
  },
};
