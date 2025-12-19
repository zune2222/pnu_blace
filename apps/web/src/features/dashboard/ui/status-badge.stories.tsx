import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge } from "./status-badge";

const meta: Meta<typeof StatusBadge> = {
  title: "Features/Dashboard/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Active: Story = {
  args: {
    color: "green",
    text: "ACTIVE",
    bgClass: "bg-green-500/10 text-green-600 dark:bg-green-400/10 dark:text-green-400",
  },
};

export const Inactive: Story = {
  args: {
    color: "gray",
    text: "INACTIVE",
    bgClass: "bg-gray-500/10 text-gray-600 dark:bg-gray-400/10 dark:text-gray-400",
  },
};

export const Warning: Story = {
  args: {
    color: "amber",
    text: "WARNING",
    bgClass: "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400",
  },
};
