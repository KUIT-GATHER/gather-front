import preview from "../../../.storybook/preview";

import FormField from "./FormField";
import Input from "./Input";
import Textarea from "./Textarea";

const meta = preview.meta({
  title: "Shared/UI/FormField",
  component: FormField,
  parameters: {
    layout: "padded",
  },
  args: {
    label: "필드",
    children: null,
  },
  argTypes: {
    children: { control: false },
    label: { control: false },
    description: { control: false },
  },
});

export const Default = meta.story({
  render: () => (
    <FormField label="활동 제목" htmlFor="activity-title">
      <Input id="activity-title" placeholder="활동 제목을 입력해 주세요" />
    </FormField>
  ),
});

export const RequiredWithDescription = meta.story({
  render: () => (
    <FormField
      label="활동 소개"
      required
      htmlFor="activity-description"
      description="참여자가 활동 내용을 미리 이해할 수 있도록 작성해 주세요."
      descriptionId="activity-description-help"
    >
      <Textarea
        id="activity-description"
        aria-describedby="activity-description-help"
        placeholder="활동 소개를 입력해 주세요"
      />
    </FormField>
  ),
});

export const Error = meta.story({
  render: () => (
    <FormField
      label="이메일"
      required
      htmlFor="email"
      error="이메일 형식을 확인해 주세요."
      errorId="email-error"
    >
      <Input
        id="email"
        invalid
        defaultValue="invalid-email"
        aria-describedby="email-error"
      />
    </FormField>
  ),
});

export const WithCharacterCount = meta.story({
  render: () => (
    <FormField
      label="활동 제목"
      required
      htmlFor="counted-title"
      count={12}
      maxLength={20}
    >
      <Input
        id="counted-title"
        defaultValue="우리 동네 책읽기"
        maxLength={20}
      />
    </FormField>
  ),
});
