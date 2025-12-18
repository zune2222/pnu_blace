import type { Meta, StoryObj } from '@storybook/react';
import { MyDashboardRankings } from './my-dashboard-rankings';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const meta: Meta<typeof MyDashboardRankings> = {
  title: 'Features/Dashboard/MyDashboardRankings',
  component: MyDashboardRankings,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MyDashboardRankings>;

export const Default: Story = {};
