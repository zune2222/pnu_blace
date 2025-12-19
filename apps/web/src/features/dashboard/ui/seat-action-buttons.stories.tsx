import type { Meta, StoryObj } from "@storybook/react";
import { SeatActionButtons } from "./seat-action-buttons";

const meta: Meta<typeof SeatActionButtons> = {
  title: "Features/Dashboard/SeatActionButtons",
  component: SeatActionButtons,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SeatActionButtons>;

export const Default: Story = {
  args: {
    onExtend: () => console.log("extend"),
    onCancel: () => console.log("cancel"),
    isExtending: false,
    isCancelling: false,
  },
};

export const Extending: Story = {
  args: {
    onExtend: () => {},
    onCancel: () => {},
    isExtending: true,
    isCancelling: false,
  },
};

export const Cancelling: Story = {
  args: {
    onExtend: () => {},
    onCancel: () => {},
    isExtending: false,
    isCancelling: true,
  },
};

export const ExtendDisabled: Story = {
  args: {
    onExtend: () => {},
    onCancel: () => {},
    isExtending: false,
    isCancelling: false,
    isExtendDisabled: true,
    onExtendDisabledClick: () => alert("연장 불가"),
  },
};
