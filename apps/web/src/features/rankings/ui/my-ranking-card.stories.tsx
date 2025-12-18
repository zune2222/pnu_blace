import type { Meta, StoryObj } from '@storybook/react';
import { MyRankingCard } from './my-ranking-card';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const meta: Meta<typeof MyRankingCard> = {
  title: 'Features/Rankings/MyRankingCard',
  component: MyRankingCard,
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
type Story = StoryObj<typeof MyRankingCard>;

export const Default: Story = {};
