import preview from "../../../.storybook/preview";

import LoadingState from "./LoadingState";

const meta = preview.meta({
  title: "Shared/UI/LoadingState",
  component: LoadingState,
  parameters: {
    layout: "padded",
  },
  args: {
    label: "목록을 불러오는 중",
    className: "min-h-40",
  },
  argTypes: {
    children: { control: false },
  },
});

export const Default = meta.story();

export const CustomLabel = meta.story({
  args: {
    label: "알림 설정을 불러오는 중",
  },
});
