import type { Meta, StoryObj } from '@storybook/react';
import { SecurityNotice } from './security-notice';

const meta: Meta<typeof SecurityNotice> = {
  title: 'Features/Login/SecurityNotice',
  component: SecurityNotice,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof SecurityNotice>;

export const Default: Story = {};
