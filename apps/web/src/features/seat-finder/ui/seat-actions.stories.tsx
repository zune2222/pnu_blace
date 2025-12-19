import type { Meta, StoryObj } from "@storybook/react";
import {
  ReserveButton,
  OccupiedNotice,
  UnavailableNotice,
  SeatInfoFooter,
} from "./seat-actions";

const meta: Meta<typeof ReserveButton> = {
  title: "Features/SeatFinder/SeatActions",
  component: ReserveButton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ReserveButton>;

export const DefaultButton: Story = {
  args: {
    onClick: () => alert("예약 클릭!"),
    isLoading: false,
  },
};

export const LoadingButton: Story = {
  args: {
    onClick: () => {},
    isLoading: true,
  },
};

export const DisabledButton: Story = {
  args: {
    onClick: () => {},
    isLoading: false,
    disabled: true,
  },
};

export const OccupiedNoticeStory: StoryObj<typeof OccupiedNotice> = {
  render: () => <OccupiedNotice />,
  name: "Occupied Notice",
};

export const UnavailableNoticeStory: StoryObj<typeof UnavailableNotice> = {
  render: () => <UnavailableNotice />,
  name: "Unavailable Notice",
};

export const SeatInfoFooterStory: StoryObj<typeof SeatInfoFooter> = {
  render: () => <SeatInfoFooter />,
  name: "Info Footer",
};

export const AllActions: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <ReserveButton onClick={() => {}} isLoading={false} />
      <OccupiedNotice />
      <UnavailableNotice />
      <SeatInfoFooter />
    </div>
  ),
  name: "All Actions",
};
