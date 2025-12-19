import type { Meta, StoryObj } from "@storybook/react";
import { ProgressBar } from "./progress-bar";

const meta: Meta<typeof ProgressBar> = {
  title: "Features/SeatFinder/ProgressBar",
  component: ProgressBar,
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
type Story = StoryObj<typeof ProgressBar>;

export const Empty: Story = {
  args: { rate: 0 },
};

export const Low: Story = {
  args: { rate: 20 },
};

export const Medium: Story = {
  args: { rate: 50 },
};

export const High: Story = {
  args: { rate: 85 },
};

export const Full: Story = {
  args: { rate: 100 },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      {[0, 20, 50, 70, 85, 100].map((rate) => (
        <div key={rate} className="flex items-center gap-4">
          <span className="text-sm w-8">{rate}%</span>
          <ProgressBar rate={rate} />
        </div>
      ))}
    </div>
  ),
};
