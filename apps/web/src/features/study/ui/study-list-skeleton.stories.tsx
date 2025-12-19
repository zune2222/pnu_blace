import type { Meta, StoryObj } from "@storybook/react";
import { StudyListSkeleton } from "./study-list-skeleton";

const meta: Meta<typeof StudyListSkeleton> = {
  title: "Features/Study/StudyListSkeleton",
  component: StudyListSkeleton,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="p-4 bg-background max-w-2xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StudyListSkeleton>;

export const Default: Story = {};
