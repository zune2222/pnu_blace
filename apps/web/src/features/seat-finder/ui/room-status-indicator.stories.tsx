import type { Meta, StoryObj } from "@storybook/react";
import { RoomStatusIndicator } from "./room-status-indicator";

const meta: Meta<typeof RoomStatusIndicator> = {
  title: "Features/SeatFinder/RoomStatusIndicator",
  component: RoomStatusIndicator,
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
type Story = StoryObj<typeof RoomStatusIndicator>;

export const LowUtilization: Story = {
  args: {
    utilizationRate: 20,
    remainingSeats: 80,
  },
};

export const MediumUtilization: Story = {
  args: {
    utilizationRate: 60,
    remainingSeats: 40,
  },
};

export const HighUtilization: Story = {
  args: {
    utilizationRate: 95,
    remainingSeats: 5,
  },
};

export const Full: Story = {
  args: {
    utilizationRate: 100,
    remainingSeats: 0,
  },
};
