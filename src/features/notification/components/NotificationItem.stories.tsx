import { fn } from "storybook/test";

import type { Meta, StoryObj } from "@storybook/react-vite";

import type { Notification } from "@/features/notification/types/notification.types";

import { NotificationItem } from "./NotificationItem";

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

const baseNotification: Notification = {
  id: 1,
  category: "ACTIVITY",
  type: "VOLUNTEER_SCHEDULE",
  message:
    "[동화책 같이 읽어요 📖] 봉사가 내일 진행돼요. 시간과 장소를 확인해 주세요.",
  targetType: "POSTING",
  targetId: 1,
  targetMeetingId: null,
  thumbnailUrl: null,
  read: false,
  createdAt: minutesAgo(5),
};

const meta = {
  title: "Features/Notification/NotificationItem",
  component: NotificationItem,
  parameters: {
    layout: "fullscreen",
  },
  globals: {
    viewport: { value: "gatherMobile", isRotated: false },
  },
  args: {
    notification: baseNotification,
    onClick: fn(),
  },
  argTypes: {
    notification: { control: false },
    onClick: { control: false },
  },
} satisfies Meta<typeof NotificationItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unread: Story = {};

export const Read: Story = {
  args: {
    notification: {
      ...baseNotification,
      id: 2,
      read: true,
      message: "[한강공원 플로깅 🌿] 봉사 일정이 일주일 남았어요.",
      createdAt: minutesAgo(60),
    },
  },
};

export const BadgeEarned: Story = {
  args: {
    notification: {
      ...baseNotification,
      id: 3,
      type: "BADGE_EARNED",
      targetType: "MY_PAGE",
      targetId: null,
      message: "새로운 뱃지를 획득했어요. 마이페이지에서 확인해 보세요.",
      createdAt: minutesAgo(30),
    },
  },
};

export const LongMessage: Story = {
  args: {
    notification: {
      ...baseNotification,
      id: 4,
      message:
        "[우리 동네 책읽기 봉사] 활동 일정과 장소가 변경되었어요. 참여 전에 새로운 시간을 확인하고 필요한 준비물을 미리 챙겨 주세요.",
      createdAt: minutesAgo(120),
    },
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
