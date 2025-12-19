import type { Meta, StoryObj } from "@storybook/react";
import { NoSeatMessage } from "./no-seat-message";

const meta: Meta<typeof NoSeatMessage> = {
  title: "Features/Dashboard/NoSeatMessage",
  component: NoSeatMessage,
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
type Story = StoryObj<typeof NoSeatMessage>;

export const Default: Story = {};
