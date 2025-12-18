import type { Meta, StoryObj } from '@storybook/react';
import { SeatHistoryTable } from './seat-history-table';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const meta: Meta<typeof SeatHistoryTable> = {
  title: 'Features/Dashboard/SeatHistoryTable',
  component: SeatHistoryTable,
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
type Story = StoryObj<typeof SeatHistoryTable>;

export const Default: Story = {};
