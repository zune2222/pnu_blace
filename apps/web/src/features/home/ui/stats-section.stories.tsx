import type { Meta, StoryObj } from "@storybook/react";
import { StatsSection } from "./stats-section";

const meta: Meta<typeof StatsSection> = {
  title: "Features/Home/StatsSection",
  component: StatsSection,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof StatsSection>;

export const Default: Story = {};
