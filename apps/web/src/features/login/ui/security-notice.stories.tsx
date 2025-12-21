import type { Meta, StoryObj } from "@storybook/react";
import { SecurityNotice } from "./security-notice";

const meta: Meta<typeof SecurityNotice> = {
  title: "Features/Login/SecurityNotice",
  component: SecurityNotice,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="p-8 bg-slate-100 min-h-[200px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SecurityNotice>;

export const Default: Story = {};
