import { Bell, Search, Settings } from "lucide-react";
import { fn } from "storybook/test";

import type { Meta, StoryObj } from "@storybook/react-vite";

import IconButton from "./IconButton";

const meta = {
  title: "Shared/UI/IconButton",
  component: IconButton,
  parameters: {
    layout: "centered",
  },
  args: {
    label: "검색",
    icon: <Search aria-hidden="true" />,
    onClick: fn(),
  },
  argTypes: {
    icon: { control: false },
    onClick: { control: false },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    label: "비활성화된 검색",
    disabled: true,
  },
};

export const Surface: Story = {
  args: {
    label: "설정",
    icon: <Settings aria-hidden="true" />,
    variant: "surface",
  },
};

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <IconButton {...args} label="작은 알림" size="small" icon={<Bell />} />
      <IconButton {...args} label="중간 알림" size="medium" icon={<Bell />} />
    </div>
  ),
};
