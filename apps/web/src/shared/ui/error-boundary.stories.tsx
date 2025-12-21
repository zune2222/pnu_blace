import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBoundary } from './error-boundary';

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Shared/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

// 에러를 발생시키는 컴포넌트
const ErrorComponent = () => {
  throw new Error('테스트 에러: 컴포넌트 렌더링 실패');
};

// 정상 컴포넌트
const NormalComponent = () => (
  <div className="p-8 text-center">
    <h2 className="text-xl font-semibold">정상 렌더링</h2>
    <p className="text-muted-foreground">에러가 없으면 이 내용이 표시됩니다.</p>
  </div>
);

export const Normal: Story = {
  render: () => (
    <ErrorBoundary>
      <NormalComponent />
    </ErrorBoundary>
  ),
  name: 'Normal (No Error)',
};

export const WithError: Story = {
  render: () => (
    <ErrorBoundary>
      <ErrorComponent />
    </ErrorBoundary>
  ),
  name: 'With Error',
};

export const CustomFallback: Story = {
  render: () => (
    <ErrorBoundary 
      fallback={
        <div className="p-8 text-center bg-destructive/10 rounded-lg">
          <p className="text-destructive font-medium">커스텀 에러 화면입니다</p>
        </div>
      }
    >
      <ErrorComponent />
    </ErrorBoundary>
  ),
  name: 'Custom Fallback',
};
