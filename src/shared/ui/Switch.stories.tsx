import preview from "../../../.storybook/preview";
import { fn } from "storybook/test";

import Switch from "./Switch";

const meta = preview.meta({
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
});

export const Off = meta.story({
  args: {
    defaultChecked: false,
  },
});

export const On = meta.story({
  args: {
    defaultChecked: true,
  },
});

export const Disabled = meta.story({
  args: {
    defaultChecked: true,
    disabled: true,
  },
});
