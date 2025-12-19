import type { Meta, StoryObj } from "@storybook/react";
import { RankingPrivacySettings } from "./ranking-privacy-settings";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const meta: Meta<typeof RankingPrivacySettings> = {
  title: "Features/Rankings/RankingPrivacySettings",
  component: RankingPrivacySettings,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="p-4 bg-background max-w-lg">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RankingPrivacySettings>;

export const Default: Story = {};
