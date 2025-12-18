import type { Meta, StoryObj } from '@storybook/react';
import { LoginHeader } from './login-header';

const meta: Meta<typeof LoginHeader> = {
  title: 'Features/Login/LoginHeader',
  component: LoginHeader,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof LoginHeader>;

export const Default: Story = {};
