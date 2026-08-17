import { useState, type ComponentProps } from "react";
import { fn } from "storybook/test";

import type { Meta, StoryObj } from "@storybook/react-vite";

import ConfirmDialog from "./ConfirmDialog";

type ConfirmDialogStoryProps = ComponentProps<typeof ConfirmDialog>;

function ControlledConfirmDialog(args: ConfirmDialogStoryProps) {
  const [open, setOpen] = useState(args.open);

  return (
    <>
      {!open ? (
        <button
          type="button"
          className="rounded-full bg-button px-5 py-3 text-white"
          onClick={() => setOpen(true)}
        >
          다이얼로그 다시 열기
        </button>
      ) : null}
      <ConfirmDialog
        {...args}
        open={open}
        onCancel={() => {
          args.onCancel();
          setOpen(false);
        }}
        onConfirm={() => {
          args.onConfirm();
          setOpen(false);
        }}
      />
    </>
  );
}

const meta = {
  title: "Shared/UI/ConfirmDialog",
  component: ConfirmDialog,
  parameters: {
    layout: "centered",
  },
  args: {
    open: true,
    title: "이 활동을 취소할까요?",
    description: "취소한 신청은 다시 복구할 수 없습니다.",
    onCancel: fn(),
    onConfirm: fn(),
  },
  argTypes: {
    title: { control: false },
    description: { control: false },
    children: { control: false },
    onCancel: { control: false },
    onConfirm: { control: false },
  },
  render: (args) => <ControlledConfirmDialog {...args} />,
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Destructive: Story = {
  args: {
    title: "모임을 탈퇴할까요?",
    description: "탈퇴하면 모임 활동과 관련된 권한을 잃게 됩니다.",
    confirmText: "탈퇴하기",
    confirmVariant: "danger",
  },
};

export const WithoutCancel: Story = {
  args: {
    title: "저장이 완료되었어요",
    description: "확인 버튼을 눌러 목록으로 돌아갑니다.",
    confirmText: "확인",
    showCancel: false,
  },
};

export const Pending: Story = {
  args: {
    title: "신청을 처리하고 있어요",
    description: "잠시만 기다려 주세요.",
    isPending: true,
  },
};
