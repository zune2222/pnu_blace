import type { Meta, StoryObj } from '@storybook/react';
import { AllTimeRankings } from './all-time-rankings';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const meta: Meta<typeof AllTimeRankings> = {
  title: 'Features/Rankings/AllTimeRankings',
  component: AllTimeRankings,
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
type Story = StoryObj<typeof AllTimeRankings>;

export const Default: Story = {};
