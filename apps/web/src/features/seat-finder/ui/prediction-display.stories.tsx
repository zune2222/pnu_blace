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
    predictionText: "",
  },
};

export const WithPrediction: Story = {
  args: {
    isLoading: false,
    predictionText: "평균 75% 사용률, 추천 시간: 오후 2시, 오후 5시",
    currentPeriod: "시험 기간",
  },
};

export const WithoutPeriod: Story = {
  args: {
    isLoading: false,
    predictionText: "평균 60% 사용률, 추천 시간: 오전 10시",
  },
};
