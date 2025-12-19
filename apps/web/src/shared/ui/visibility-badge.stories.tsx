import type { Meta, StoryObj } from "@storybook/react";
import { VisibilityBadge } from "./visibility-badge";

const meta: Meta<typeof VisibilityBadge> = {
  title: "Shared/UI/VisibilityBadge",
  component: VisibilityBadge,
  tags: ["autodocs"],
  argTypes: {
    visibility: {
      control: "select",
      options: ["PUBLIC", "PASSWORD", "PRIVATE"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof VisibilityBadge>;

export const Public: Story = {
  args: { visibility: "PUBLIC" },
};

export const Password: Story = {
  args: { visibility: "PASSWORD" },
};

export const Private: Story = {
  args: { visibility: "PRIVATE" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-2">
      <VisibilityBadge visibility="PUBLIC" />
      <VisibilityBadge visibility="PASSWORD" />
      <VisibilityBadge visibility="PRIVATE" />
    </div>
  ),
};
