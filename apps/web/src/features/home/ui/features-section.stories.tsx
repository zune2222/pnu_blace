import type { Meta, StoryObj } from '@storybook/react';
import { FeaturesSection } from './features-section';

const meta: Meta<typeof FeaturesSection> = {
  title: 'Features/Home/FeaturesSection',
  component: FeaturesSection,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof FeaturesSection>;

export const Default: Story = {};
