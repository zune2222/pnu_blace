import type { Meta, StoryObj } from "@storybook/react";
import { AvailabilityBadge } from "./availability-badge";

const meta: Meta<typeof AvailabilityBadge> = {
  title: "Features/SeatFinder/AvailabilityBadge",
  component: AvailabilityBadge,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AvailabilityBadge>;

export const Available: Story = {
  args: { remainingSeats: 50 },
};

export const LimitedSeats: Story = {
  args: { remainingSeats: 5 },
};

export const Full: Story = {
  args: { remainingSeats: 0 },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <AvailabilityBadge remainingSeats={50} />
      <AvailabilityBadge remainingSeats={5} />
      <AvailabilityBadge remainingSeats={0} />
    </div>
  ),
};
