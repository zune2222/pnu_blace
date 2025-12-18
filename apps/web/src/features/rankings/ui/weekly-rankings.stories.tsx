import type { Meta, StoryObj } from '@storybook/react';
import { WeeklyRankings } from './weekly-rankings';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const meta: Meta<typeof WeeklyRankings> = {
  title: 'Features/Rankings/WeeklyRankings',
  component: WeeklyRankings,
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
type Story = StoryObj<typeof WeeklyRankings>;

export const Default: Story = {};
