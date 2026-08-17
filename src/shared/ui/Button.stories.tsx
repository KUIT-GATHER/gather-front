import preview from "../../../.storybook/preview";
import { ArrowRight, Check, Plus } from "lucide-react";
import { fn } from "storybook/test";

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

const meta = preview.meta({
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
});

export const Default = meta.story();

export const Disabled = meta.story({
  args: {
    children: "비활성화",
    disabled: true,
  },
});

export const WithIcons = meta.story({
  args: {
    children: "다음 단계",
    leftIcon: <Plus aria-hidden="true" />,
    rightIcon: <ArrowRight aria-hidden="true" />,
  },
});

export const AllVariants = meta.story({
  render: (args) => (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {buttonVariants.map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
});

export const AllSizes = meta.story({
  render: (args) => (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {buttonSizes.map((size) => (
        <Button key={size} {...args} size={size}>
          {size}
        </Button>
      ))}
    </div>
  ),
});

export const FullWidth = meta.story({
  render: (args) => (
    <div className="w-[360px]">
      <Button {...args} fullWidth>
        화면 너비에 맞는 버튼
      </Button>
    </div>
  ),
});

export const WithConfirmationIcon = meta.story({
  args: {
    children: "저장 완료",
    leftIcon: <Check aria-hidden="true" />,
  },
});
