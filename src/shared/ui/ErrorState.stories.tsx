import { CircleAlert, RefreshCw } from "lucide-react";
import { fn } from "storybook/test";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { ErrorState } from "./ErrorState";

const meta = {
  title: "Shared/UI/ErrorState",
  component: ErrorState,
  parameters: {
    layout: "padded",
  },
  args: {
    title: "문제가 발생했어요",
    description: "잠시 후 다시 시도해 주세요.",
  },
  argTypes: {
    icon: { control: false },
    primaryAction: { control: false },
    secondaryAction: { control: false },
  },
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RetryAction: Story = {
  args: {
    icon: <CircleAlert aria-hidden="true" />,
    primaryAction: {
      label: "다시 시도",
      onClick: fn(),
    },
  },
};

export const WithSecondaryAction: Story = {
  args: {
    title: "공고를 찾을 수 없어요",
    description: "주소가 바뀌었거나 삭제된 공고일 수 있어요.",
    primaryAction: {
      label: "다시 시도",
      onClick: fn(),
    },
    secondaryAction: {
      label: "홈으로 이동",
      onClick: fn(),
    },
  },
};

export const RetryWithIcon: Story = {
  args: {
    title: "알림 설정을 불러오지 못했어요",
    primaryAction: {
      label: "다시 시도",
      onClick: fn(),
    },
    icon: <RefreshCw aria-hidden="true" />,
  },
};
