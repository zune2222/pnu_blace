import type { Meta, StoryObj } from "@storybook/react";
import { SeatStatusAlert } from "./seat-status-alert";

const meta: Meta<typeof SeatStatusAlert> = {
  title: "Features/SeatFinder/SeatStatusAlert",
  component: SeatStatusAlert,
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["occupied", "available", "unavailable"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof SeatStatusAlert>;

export const Occupied: Story = {
  args: { status: "occupied" },
};

export const Available: Story = {
  args: { status: "available" },
};

export const Unavailable: Story = {
  args: { status: "unavailable" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <SeatStatusAlert status="available" />
      <SeatStatusAlert status="occupied" />
      <SeatStatusAlert status="unavailable" />
    </div>
  ),
};
