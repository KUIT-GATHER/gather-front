import preview from "../../../.storybook/preview";

import Textarea from "./Textarea";

const meta = preview.meta({
  title: "Shared/UI/Textarea",
  component: Textarea,
  parameters: {
    layout: "padded",
  },
  args: {
    placeholder: "활동 내용을 입력해 주세요",
    "aria-label": "활동 내용",
  },
  argTypes: {
    onChange: { control: false },
    onBlur: { control: false },
    onFocus: { control: false },
  },
});

export const Default = meta.story();

export const Filled = meta.story({
  args: {
    defaultValue:
      "아이들과 함께 책을 읽고 서로의 생각을 나누는 활동입니다.\n처음 참여하는 분도 편하게 오실 수 있어요.",
  },
});

export const Disabled = meta.story({
  args: {
    defaultValue: "작성 권한이 없는 내용입니다.",
    disabled: true,
  },
});
