import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { FavoriteHeart } from './favorite-heart';

const meta: Meta<typeof FavoriteHeart> = {
  title: 'Shared/FavoriteHeart',
  component: FavoriteHeart,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof FavoriteHeart>;

export const NotFavorite: Story = {
  args: {
    isFavorite: false,
  },
};

export const Favorite: Story = {
  args: {
    isFavorite: true,
  },
};

export const Small: Story = {
  args: {
    isFavorite: true,
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    isFavorite: true,
    size: 'lg',
  },
};

export const InContext: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      <div className="flex-1">
        <h3 className="font-medium">제1열람실</h3>
        <p className="text-sm text-muted-foreground">정보관 4층</p>
      </div>
      <FavoriteHeart isFavorite={true} onClick={fn()} />
    </div>
  ),
  name: 'In Context',
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <FavoriteHeart isFavorite={true} size="sm" onClick={fn()} />
      <FavoriteHeart isFavorite={true} size="md" onClick={fn()} />
      <FavoriteHeart isFavorite={true} size="lg" onClick={fn()} />
    </div>
  ),
  name: 'All Sizes',
};
