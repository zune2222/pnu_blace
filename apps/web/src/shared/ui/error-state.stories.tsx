import type { Meta, StoryObj } from '@storybook/react';
import { ErrorState, NetworkError, EmptyState } from './error-state';
import { AlertCircle } from 'lucide-react';

const meta: Meta<typeof ErrorState> = {
  title: 'Shared/ErrorState',
  component: ErrorState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

// ErrorState variants
export const Default: StoryObj<typeof ErrorState> = {
  args: {
    message: '데이터를 불러올 수 없습니다.',
    onRetry: () => alert('다시 시도!'),
  },
};

export const Inline: StoryObj<typeof ErrorState> = {
  args: {
    variant: 'inline',
    message: '데이터 로드 실패',
    onRetry: () => alert('다시 시도!'),
  },
};

export const Card: StoryObj<typeof ErrorState> = {
  args: {
    variant: 'card',
    title: '오류가 발생했습니다',
    message: '잠시 후 다시 시도해주세요.',
    onRetry: () => alert('다시 시도!'),
  },
};

export const WithoutRetry: StoryObj<typeof ErrorState> = {
  args: {
    message: '권한이 없습니다.',
  },
  name: 'Without Retry Button',
};

// NetworkError
export const Network: StoryObj<typeof NetworkError> = {
  render: () => <NetworkError onRetry={() => alert('다시 시도!')} />,
  name: 'NetworkError',
};

// EmptyState
export const Empty: StoryObj<typeof EmptyState> = {
  render: () => (
    <EmptyState 
      title="데이터가 없습니다" 
      message="아직 등록된 항목이 없습니다."
    />
  ),
  name: 'EmptyState',
};

export const EmptyWithIcon: StoryObj<typeof EmptyState> = {
  render: () => (
    <EmptyState 
      title="검색 결과가 없습니다"
      message="다른 키워드로 검색해보세요."
      icon={<AlertCircle className="w-8 h-8 text-muted-foreground/60" />}
    />
  ),
  name: 'EmptyState (with icon)',
};

export const EmptyWithAction: StoryObj<typeof EmptyState> = {
  render: () => (
    <EmptyState 
      title="즐겨찾기가 없습니다"
      message="자주 사용하는 열람실을 추가해보세요."
      action={
        <button className="px-4 py-2 bg-foreground text-background rounded-lg text-sm">
          열람실 보기
        </button>
      }
    />
  ),
  name: 'EmptyState (with action)',
};
