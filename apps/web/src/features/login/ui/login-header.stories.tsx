import type { Meta, StoryObj } from "@storybook/react";
import { LoginHeader } from "./login-header";

const meta: Meta<typeof LoginHeader> = {
  title: "Features/Login/LoginHeader",
  component: LoginHeader,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="p-8 bg-gradient-to-br from-blue-600 to-blue-800 min-h-[300px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LoginHeader>;

export const Default: Story = {};
