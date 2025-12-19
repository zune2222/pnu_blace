import type { Meta, StoryObj } from "@storybook/react";
import { HeroSection } from "./hero-section";

const meta: Meta<typeof HeroSection> = {
  title: "Features/Home/HeroSection",
  component: HeroSection,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof HeroSection>;

export const Default: Story = {};
