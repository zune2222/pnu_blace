import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Shared/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: '저장하기',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: '취소',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: '더보기',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: '작은 버튼',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: '큰 버튼',
  },
};

export const Disabled: Story = {
  args: {
    children: '비활성화',
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
      </div>
      <div className="flex gap-2">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
    </div>
  ),
  name: 'All Variants',
};
