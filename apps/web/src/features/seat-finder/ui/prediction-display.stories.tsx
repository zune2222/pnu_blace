import type { Meta, StoryObj } from "@storybook/react";
import { PredictionDisplay } from "./prediction-display";

const meta: Meta<typeof PredictionDisplay> = {
  title: "Features/SeatFinder/PredictionDisplay",
  component: PredictionDisplay,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PredictionDisplay>;

export const Loading: Story = {
  args: {
    isLoading: true,
    prediction: null,
  },
};

export const HighConfidence: Story = {
  args: {
    isLoading: false,
    prediction: {
      seatNo: "42",
      predictedEndTime: new Date(Date.now() + 90 * 60000).toISOString(),
      confidence: 0.85,
      message: "평상시 패턴 기준, 약 1시간 30분 후 비워질 것으로 예측됩니다.",
      currentStatus: "OCCUPIED",
      occupiedSince: new Date(Date.now() - 120 * 60000).toISOString(),
      elapsedMinutes: 120,
      medianRemainingMinutes: 90,
      remainingRange: { optimistic: 45, pessimistic: 150 },
      probabilityBands: [
        { withinMinutes: 30, probability: 0.25 },
        { withinMinutes: 60, probability: 0.42 },
      ],
      segment: {
        periodType: "NORMAL",
        startHourBucket: "MORNING",
        dayType: "WEEKDAY",
      },
      sampleSize: 1200,
    },
  },
};

export const LowConfidence: Story = {
  args: {
    isLoading: false,
    prediction: {
      seatNo: "15",
      predictedEndTime: new Date(Date.now() + 30 * 60000).toISOString(),
      confidence: 0.3,
      message: "예측 데이터가 부족합니다.",
      currentStatus: "OCCUPIED",
      medianRemainingMinutes: 30,
      probabilityBands: [
        { withinMinutes: 30, probability: 0.6 },
        { withinMinutes: 60, probability: 0.85 },
      ],
    },
  },
};

export const NoPrediction: Story = {
  args: {
    isLoading: false,
    prediction: null,
  },
};
