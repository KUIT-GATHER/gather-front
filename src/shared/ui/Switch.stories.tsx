import { fn } from "storybook/test";

import type { Meta, StoryObj } from "@storybook/react-vite";

import Switch from "./Switch";

const meta = {
  title: "Shared/UI/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
  },
  args: {
    "aria-label": "봉사 일정 알림",
    onCheckedChange: fn(),
  },
  argTypes: {
    onCheckedChange: { control: false },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {
  args: {
    defaultChecked: false,
  },
};

export const On: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    defaultChecked: true,
    disabled: true,
  },
};
