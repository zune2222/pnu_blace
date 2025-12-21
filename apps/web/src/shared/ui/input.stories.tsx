import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';

const meta: Meta<typeof Input> = {
  title: 'Shared/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: '입력해주세요',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <label className="text-sm font-medium">학번</label>
      <Input placeholder="202012345" />
    </div>
  ),
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: '비밀번호',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: '비활성화된 입력',
    disabled: true,
  },
};

export const WithValue: Story = {
  args: {
    value: '202012345',
    readOnly: true,
  },
};

export const Error: Story = {
  render: () => (
    <div className="space-y-2">
      <Input placeholder="학번" className="border-destructive" />
      <p className="text-sm text-destructive">학번을 입력해주세요</p>
    </div>
  ),
};

export const LoginForm: Story = {
  render: () => (
    <div className="w-80 space-y-4 p-4 border rounded-lg">
      <div className="space-y-2">
        <label className="text-sm font-medium">학번</label>
        <Input placeholder="202012345" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">비밀번호</label>
        <Input type="password" placeholder="비밀번호" />
      </div>
    </div>
  ),
  name: 'Login Form Example',
};
