import { useState, type ComponentProps } from "react";
import { fn } from "storybook/test";

import type { Meta, StoryObj } from "@storybook/react-vite";

import Select from "./Select";

const sortOptions = [
  { label: "전체", value: "all" },
  { label: "최신순 ✨", value: "latest" },
  { label: "인기순 🔥", value: "popular" },
  { label: "마감임박 ⏰", value: "deadline" },
  { label: "공고기반", value: "official" },
  { label: "자유모임", value: "free" },
];

const longOptions = Array.from({ length: 16 }, (_, index) => ({
  label: `옵션 ${index + 1}`,
  value: `option-${index + 1}`,
}));

type SelectStoryProps = ComponentProps<typeof Select>;

function InteractiveSelect(args: SelectStoryProps) {
  const [value, setValue] = useState(args.value);

  return (
    <Select
      {...args}
      value={value}
      onChange={(nextValue) => {
        args.onChange(nextValue);
        setValue(nextValue);
      }}
    />
  );
}

const meta = {
  title: "Shared/UI/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  args: {
    options: sortOptions,
    value: "all",
    onChange: fn(),
    ariaLabel: "정렬",
  },
  argTypes: {
    options: { control: false },
    onChange: { control: false },
  },
  render: (args) => <InteractiveSelect {...args} />,
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: {
    value: "latest",
  },
};

export const Disabled: Story = {
  args: {
    value: "latest",
    disabled: true,
  },
};

export const LongOption: Story = {
  args: {
    options: [
      {
        label: "전체 봉사 모임과 신청 가능한 모집 공고를 함께 보기",
        value: "all",
      },
      {
        label: "이번 주 안에 모집이 마감되는 장기 봉사 모임만 보기",
        value: "deadline",
      },
    ],
    value: "all",
  },
};

export const ManyOptions: Story = {
  args: {
    options: longOptions,
    value: "option-1",
  },
};
