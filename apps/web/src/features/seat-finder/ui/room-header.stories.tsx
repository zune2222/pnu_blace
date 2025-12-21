import type { Meta, StoryObj } from "@storybook/react";
import { RoomHeader } from "./room-header";

const meta: Meta<typeof RoomHeader> = {
  title: "Features/SeatFinder/RoomHeader",
  component: RoomHeader,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="group p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RoomHeader>;

export const Default: Story = {
  args: { roomName: "제1열람실 A구역" },
};

export const Long: Story = {
  args: { roomName: "부산대학교 제1도서관 노트북 열람실 (2층 북측)" },
};
