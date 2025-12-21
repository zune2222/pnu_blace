import type { Meta, StoryObj } from "@storybook/react";
import { RoomInfoRow } from "./room-info-row";

const meta: Meta<typeof RoomInfoRow> = {
  title: "Features/SeatFinder/RoomInfoRow",
  component: RoomInfoRow,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RoomInfoRow>;

export const Default: Story = {
  args: {
    timeStart: "06:00",
    timeEnd: "23:00",
    totalSeats: 100,
    usedSeats: 55,
    utilizationRate: 55,
  },
};

export const Crowded: Story = {
  args: {
    timeStart: "09:00",
    timeEnd: "21:00",
    totalSeats: 80,
    usedSeats: 75,
    utilizationRate: 94,
  },
};
