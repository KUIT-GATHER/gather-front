import preview from "../../../.storybook/preview";
import { Bell, Search, Settings } from "lucide-react";
import { fn } from "storybook/test";

import IconButton from "./IconButton";

const meta = preview.meta({
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
});

export const Default = meta.story();

export const Disabled = meta.story({
  args: {
    label: "비활성화된 검색",
    disabled: true,
  },
});

export const Surface = meta.story({
  args: {
    label: "설정",
    icon: <Settings aria-hidden="true" />,
    variant: "surface",
  },
});

export const AllSizes = meta.story({
  render: (args) => (
    <div className="flex items-center gap-4">
      <IconButton {...args} label="작은 알림" size="small" icon={<Bell />} />
      <IconButton {...args} label="중간 알림" size="medium" icon={<Bell />} />
    </div>
  ),
});
