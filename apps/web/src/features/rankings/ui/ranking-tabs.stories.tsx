import type { Meta, StoryObj } from '@storybook/react';
import { RankingTabs } from './ranking-tabs';

const meta: Meta<typeof RankingTabs> = {
  title: 'Features/Rankings/RankingTabs',
  component: RankingTabs,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof RankingTabs>;

export const Weekly: Story = {
  args: {
    activeTab: 'weekly',
    onTabChange: () => {},
  },
};

export const AllTime: Story = {
  args: {
    activeTab: 'allTime',
    onTabChange: () => {},
  },
};
