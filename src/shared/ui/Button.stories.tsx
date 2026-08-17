import { ArrowRight, Check, Plus } from "lucide-react";
import { fn } from "storybook/test";

import type { Meta, StoryObj } from "@storybook/react-vite";

import Button from "./Button";

const buttonVariants = [
  "primary",
  "primaryOutline",
  "dark",
  "neutral",
  "danger",
  "dangerOutline",
] as const;

const buttonSizes = ["large", "medium", "pill", "next"] as const;

const meta = {
  title: "Shared/UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "계속하기",
    onClick: fn(),
  },
  argTypes: {
    variant: { control: "select", options: buttonVariants },
    size: { control: "select", options: buttonSizes },
    children: { control: false },
    leftIcon: { control: false },
    rightIcon: { control: false },
    onClick: { control: false },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    children: "비활성화",
    disabled: true,
  },
};

export const WithIcons: Story = {
  args: {
    children: "다음 단계",
    leftIcon: <Plus aria-hidden="true" />,
    rightIcon: <ArrowRight aria-hidden="true" />,
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {buttonVariants.map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {buttonSizes.map((size) => (
        <Button key={size} {...args} size={size}>
          {size}
        </Button>
      ))}
    </div>
  ),
};

export const FullWidth: Story = {
  render: (args) => (
    <div className="w-[360px]">
      <Button {...args} fullWidth>
        화면 너비에 맞는 버튼
      </Button>
    </div>
  ),
};

export const WithConfirmationIcon: Story = {
  args: {
    children: "저장 완료",
    leftIcon: <Check aria-hidden="true" />,
  },
};
