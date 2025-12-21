import type { Meta, StoryObj } from "@storybook/react";
import { LoadingSkeleton } from "./loading-skeleton";

const meta: Meta<typeof LoadingSkeleton> = {
  title: "Features/SeatFinder/LoadingSkeleton",
  component: LoadingSkeleton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof LoadingSkeleton>;

export const Default: Story = {
  args: { count: 6 },
};

export const Minimal: Story = {
  args: { count: 2 },
};
