import preview from "../../../.storybook/preview";

import Spinner from "./Spinner";

const meta = preview.meta({
  title: "Shared/UI/Spinner",
  component: Spinner,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    label: { control: "text" },
  },
});

export const Default = meta.story();

export const Small = meta.story({
  args: {
    size: "small",
  },
});

export const AccessibleLabel = meta.story({
  args: {
    label: "알림 설정을 저장하는 중",
  },
});
