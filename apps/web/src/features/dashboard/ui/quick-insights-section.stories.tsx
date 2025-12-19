import type { Meta, StoryObj } from "@storybook/react";
import { QuickInsightsSection } from "./quick-insights-section";

const meta: Meta<typeof QuickInsightsSection> = {
  title: "Features/Dashboard/QuickInsightsSection",
  component: QuickInsightsSection,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof QuickInsightsSection>;

export const Default: Story = {};
