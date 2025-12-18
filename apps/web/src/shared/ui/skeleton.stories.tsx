import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton, SkeletonText, SkeletonCard, SkeletonList, SkeletonTable, SkeletonStats } from './skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Shared/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

// Base Skeleton
export const Default: StoryObj<typeof Skeleton> = {
  args: {
    className: 'h-4 w-full',
  },
};

export const Circle: StoryObj<typeof Skeleton> = {
  args: {
    className: 'h-12 w-12 rounded-full',
  },
};

// SkeletonText
export const Text: StoryObj<typeof SkeletonText> = {
  render: () => <SkeletonText lines={3} />,
  name: 'SkeletonText',
};

export const TextSingleLine: StoryObj<typeof SkeletonText> = {
  render: () => <SkeletonText lines={1} />,
  name: 'SkeletonText (1 line)',
};

// SkeletonCard
export const Card: StoryObj<typeof SkeletonCard> = {
  render: () => <SkeletonCard />,
  name: 'SkeletonCard',
};

export const CardNoHeader: StoryObj<typeof SkeletonCard> = {
  render: () => <SkeletonCard hasHeader={false} />,
  name: 'SkeletonCard (no header)',
};

// SkeletonList
export const List: StoryObj<typeof SkeletonList> = {
  render: () => <SkeletonList count={5} />,
  name: 'SkeletonList',
};

export const ListSmall: StoryObj<typeof SkeletonList> = {
  render: () => <SkeletonList count={3} />,
  name: 'SkeletonList (3 items)',
};

// SkeletonTable
export const Table: StoryObj<typeof SkeletonTable> = {
  render: () => <SkeletonTable rows={5} cols={4} />,
  name: 'SkeletonTable',
};

// SkeletonStats
export const Stats: StoryObj<typeof SkeletonStats> = {
  render: () => <SkeletonStats />,
  name: 'SkeletonStats',
};
