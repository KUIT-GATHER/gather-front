import type { Meta, StoryObj } from "@storybook/react-vite";

import LoadingState from "./LoadingState";

const meta = {
  title: "Shared/UI/LoadingState",
  component: LoadingState,
  parameters: {
    layout: "padded",
  },
  args: {
    label: "목록을 불러오는 중",
    className: "min-h-40",
  },
  argTypes: {
    children: { control: false },
  },
} satisfies Meta<typeof LoadingState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomLabel: Story = {
  args: {
    label: "알림 설정을 불러오는 중",
  },
};
