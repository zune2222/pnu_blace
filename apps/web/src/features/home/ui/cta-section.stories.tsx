import type { Meta, StoryObj } from "@storybook/react";
import { CtaSection } from "./cta-section";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const meta: Meta<typeof CtaSection> = {
  title: "Features/Home/CtaSection",
  component: CtaSection,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CtaSection>;

export const Default: Story = {};
