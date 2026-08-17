import { ChevronLeft, MoreHorizontal, Search } from "lucide-react";
import { fn } from "storybook/test";

import type { Meta, StoryObj } from "@storybook/react-vite";

import IconButton from "./IconButton";
import PageHeader from "./PageHeader";

const meta = {
  title: "Shared/UI/PageHeader",
  component: PageHeader,
  parameters: {
    layout: "fullscreen",
  },
  globals: {
    viewport: { value: "gatherMobile", isRotated: false },
  },
  args: {
    title: "알림",
  },
  argTypes: {
    leftAction: { control: false },
    rightAction: { control: false },
    onBack: { control: false },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TitleOnly: Story = {};

export const BackAction: Story = {
  args: {
    title: "이메일 로그인",
    onBack: fn(),
    backLabel: "로그인 시작 화면으로 돌아가기",
  },
};

export const RightAction: Story = {
  args: {
    title: "알림",
    rightAction: (
      <IconButton label="검색" icon={<Search aria-hidden="true" />} />
    ),
  },
};

export const CenteredWithActions: Story = {
  args: {
    title: "활동 상세",
    titleAlign: "center",
    leftAction: (
      <IconButton label="뒤로가기" icon={<ChevronLeft aria-hidden="true" />} />
    ),
    rightAction: (
      <IconButton label="더보기" icon={<MoreHorizontal aria-hidden="true" />} />
    ),
  },
};

export const LongTitle: Story = {
  args: {
    title: "아주 긴 페이지 제목이 들어와도 말줄임 처리됩니다",
    titleAlign: "center",
    leftAction: (
      <IconButton label="뒤로가기" icon={<ChevronLeft aria-hidden="true" />} />
    ),
  },
};
