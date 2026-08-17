import preview from "../../../.storybook/preview";
import { useState, type ComponentProps } from "react";
import { fn } from "storybook/test";

import Button from "./Button";
import BottomSheet from "./BottomSheet";

type BottomSheetStoryProps = ComponentProps<typeof BottomSheet>;

function ControlledBottomSheet(args: BottomSheetStoryProps) {
  const [open, setOpen] = useState(args.open);

  const handleOpenChange = (nextOpen: boolean) => {
    args.onOpenChange(nextOpen);
    setOpen(nextOpen);
  };

  return (
    <div className="min-h-[200px] w-full">
      {!open ? (
        <Button size="medium" onClick={() => setOpen(true)}>
          시트 다시 열기
        </Button>
      ) : null}
      <BottomSheet {...args} open={open} onOpenChange={handleOpenChange} />
    </div>
  );
}

const meta = preview.meta({
  title: "Shared/UI/BottomSheet",
  component: BottomSheet,
  parameters: {
    layout: "fullscreen",
  },
  globals: {
    viewport: { value: "gatherMobile", isRotated: false },
  },
  args: {
    open: true,
    onOpenChange: fn(),
    title: "알림 설정",
    children: (
      <p className="text-body-14 text-text-gray-300">
        시트 안의 콘텐츠는 필요한 만큼 스크롤할 수 있습니다.
      </p>
    ),
  },
  argTypes: {
    children: { control: false },
    footer: { control: false },
    leadingAction: { control: false },
    onBack: { control: false },
    onOpenChange: { control: false },
  },
  render: (args) => <ControlledBottomSheet {...args} />,
});

export const DefaultOpen = meta.story();

export const WithDescription = meta.story({
  args: {
    title: "봉사 일정 선택",
    description: "참여 가능한 날짜를 확인해 주세요.",
    children: (
      <div className="space-y-3 text-body-14 text-text-gray-300">
        <p>활동 날짜와 시간을 선택하면 신청을 이어갈 수 있어요.</p>
        <p>닫기 버튼으로 시트를 닫을 수 있습니다.</p>
      </div>
    ),
  },
});

export const WithFooter = meta.story({
  args: {
    title: "신청 전 확인",
    children: (
      <div className="space-y-3 text-body-14 text-text-gray-300">
        <p>신청 내용을 확인한 뒤 완료 버튼을 눌러 주세요.</p>
        <p>버튼 영역은 안전 영역을 고려해 하단에 고정됩니다.</p>
      </div>
    ),
    footer: <Button fullWidth>신청하기</Button>,
  },
});

export const WithBackAction = meta.story({
  args: {
    title: "봉사 활동",
    onBack: fn(),
    backLabel: "알림 설정으로 돌아가기",
    children: <p className="text-body-14 text-text-gray-300">상세 설정 화면</p>,
  },
});

export const LongScrollableContent = meta.story({
  args: {
    title: "긴 안내 내용",
    description: "스크롤 가능한 콘텐츠 영역을 확인하는 상태입니다.",
    children: (
      <div className="space-y-5 text-body-14 leading-6 text-text-gray-300">
        {Array.from({ length: 8 }, (_, index) => (
          <p key={index}>
            {index + 1}. Gather 활동에 참여하기 전 일정과 장소를 확인해 주세요.
            필요한 경우 시트 안에서 내용을 스크롤해 확인할 수 있습니다.
          </p>
        ))}
      </div>
    ),
    footer: <Button fullWidth>확인했어요</Button>,
  },
});
