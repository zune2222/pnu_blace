import type { Meta, StoryObj } from '@storybook/react';
import { StreakHeatmap } from './streak-heatmap';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const meta: Meta<typeof StreakHeatmap> = {
  title: 'Features/Dashboard/StreakHeatmap',
  component: StreakHeatmap,
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
type Story = StoryObj<typeof StreakHeatmap>;

export const Default: Story = {};
