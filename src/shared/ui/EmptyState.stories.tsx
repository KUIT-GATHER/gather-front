import { Inbox, Search } from "lucide-react";
import { fn } from "storybook/test";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { EmptyState } from "./EmptyState";

const meta = {
  title: "Shared/UI/EmptyState",
  component: EmptyState,
  parameters: {
    layout: "padded",
  },
  args: {
    title: "아직 저장한 공고가 없어요",
    description: "관심 있는 봉사 공고를 저장하면 여기에서 확인할 수 있어요.",
  },
  argTypes: {
    icon: { control: false },
    onAction: { control: false },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    icon: <Search aria-hidden="true" />,
    actionLabel: "공고 찾아보기",
    onAction: fn(),
  },
};

export const WithIcon: Story = {
  args: {
    title: "활동 기록이 없어요",
    description: "봉사 활동에 참여하면 기록이 쌓여요.",
    icon: <Inbox aria-hidden="true" />,
  },
};
