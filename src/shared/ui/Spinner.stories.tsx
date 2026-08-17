import type { Meta, StoryObj } from "@storybook/react-vite";

import Spinner from "./Spinner";

const meta = {
  title: "Shared/UI/Spinner",
  component: Spinner,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    label: { control: "text" },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
  args: {
    size: "small",
  },
};

export const AccessibleLabel: Story = {
  args: {
    label: "알림 설정을 저장하는 중",
  },
};
