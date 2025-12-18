import type { Meta, StoryObj } from '@storybook/react';
import { LoadingSpinner, FullPageLoader, InlineLoader, ButtonLoader, SectionLoader } from './loading';

const meta: Meta<typeof LoadingSpinner> = {
  title: 'Shared/Loading',
  component: LoadingSpinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

// LoadingSpinner
export const Spinner: StoryObj<typeof LoadingSpinner> = {
  args: {
    size: 'md',
  },
  name: 'LoadingSpinner',
};

export const SpinnerSmall: StoryObj<typeof LoadingSpinner> = {
  args: {
    size: 'sm',
  },
  name: 'LoadingSpinner (sm)',
};

export const SpinnerLarge: StoryObj<typeof LoadingSpinner> = {
  args: {
    size: 'lg',
  },
  name: 'LoadingSpinner (lg)',
};

// FullPageLoader
export const FullPage: StoryObj<typeof FullPageLoader> = {
  render: () => (
    <div className="relative w-full h-64 bg-background">
      <FullPageLoader message="로딩 중..." />
    </div>
  ),
  name: 'FullPageLoader',
  parameters: {
    layout: 'fullscreen',
  },
};

// InlineLoader
export const Inline: StoryObj<typeof InlineLoader> = {
  render: () => <InlineLoader message="데이터를 불러오는 중..." />,
  name: 'InlineLoader',
};

export const InlineNoMessage: StoryObj<typeof InlineLoader> = {
  render: () => <InlineLoader />,
  name: 'InlineLoader (no message)',
};

// ButtonLoader
export const Button: StoryObj<typeof ButtonLoader> = {
  render: () => (
    <button className="px-4 py-2 bg-foreground text-background rounded-lg">
      <ButtonLoader isLoading={true}>저장</ButtonLoader>
    </button>
  ),
  name: 'ButtonLoader (loading)',
};

export const ButtonNotLoading: StoryObj<typeof ButtonLoader> = {
  render: () => (
    <button className="px-4 py-2 bg-foreground text-background rounded-lg">
      <ButtonLoader isLoading={false}>저장</ButtonLoader>
    </button>
  ),
  name: 'ButtonLoader (not loading)',
};

// SectionLoader
export const Section: StoryObj<typeof SectionLoader> = {
  render: () => (
    <SectionLoader isLoading={true}>
      <div className="p-8 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold">콘텐츠 영역</h2>
        <p className="text-muted-foreground">이 위에 로딩 오버레이가 표시됩니다.</p>
      </div>
    </SectionLoader>
  ),
  name: 'SectionLoader (loading)',
};

export const SectionNotLoading: StoryObj<typeof SectionLoader> = {
  render: () => (
    <SectionLoader isLoading={false}>
      <div className="p-8 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold">콘텐츠 영역</h2>
        <p className="text-muted-foreground">로딩이 완료된 상태입니다.</p>
      </div>
    </SectionLoader>
  ),
  name: 'SectionLoader (not loading)',
};
