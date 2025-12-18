import type { Meta, StoryObj } from '@storybook/react';
import { CurrentSeatWidget } from './current-seat-widget';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const meta: Meta<typeof CurrentSeatWidget> = {
  title: 'Features/Dashboard/CurrentSeatWidget',
  component: CurrentSeatWidget,
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
type Story = StoryObj<typeof CurrentSeatWidget>;

export const Default: Story = {};
