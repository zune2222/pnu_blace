import type { Meta, StoryObj } from "@storybook/react";
import { RankingTabs } from "./ranking-tabs";
import { useState } from "react";

const meta: Meta<typeof RankingTabs> = {
  title: "Features/Rankings/RankingTabs",
  component: RankingTabs,
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
type Story = StoryObj<typeof RankingTabs>;

export const AllTimeActive: Story = {
  args: {
    activeTab: "all-time",
    onTabChange: () => {},
  },
};

export const WeeklyActive: Story = {
  args: {
    activeTab: "weekly",
    onTabChange: () => {},
  },
};

export const Interactive: Story = {
  render: function Render() {
    const [tab, setTab] = useState<"all-time" | "weekly">("all-time");
    return <RankingTabs activeTab={tab} onTabChange={setTab} />;
  },
};
