import preview from "../../../.storybook/preview";

import Input from "./Input";

const meta = preview.meta({
  title: "Shared/UI/Input",
  component: Input,
  parameters: {
    layout: "padded",
  },
  args: {
    placeholder: "이메일을 입력해 주세요",
    "aria-label": "이메일",
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
    defaultValue: "hello@gather.example",
  },
});

export const Disabled = meta.story({
  args: {
    defaultValue: "수정할 수 없는 값",
    disabled: true,
  },
});

export const Invalid = meta.story({
  args: {
    defaultValue: "잘못된 이메일",
    invalid: true,
    "aria-describedby": "email-error",
  },
  render: (args) => (
    <div className="w-full max-w-[360px]">
      <Input {...args} />
      <p id="email-error" className="mt-1.5 text-xs text-point-red">
        이메일 형식을 확인해 주세요.
      </p>
    </div>
  ),
});
