import type { Meta, StoryObj } from "@storybook/react";
import { LoginForm } from "./login-form";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const meta: Meta<typeof LoginForm> = {
  title: "Features/Login/LoginForm",
  component: LoginForm,
  tags: ["autodocs"],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="p-8 bg-gradient-to-br from-blue-600 to-blue-800 min-h-[400px] flex items-center justify-center">
          <div className="w-full max-w-md">
            <Story />
          </div>
        </div>
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LoginForm>;

export const Default: Story = {};
