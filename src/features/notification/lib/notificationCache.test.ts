import { describe, expect, it } from "vitest";

import type {
  Notification,
  NotificationPage,
} from "@/features/notification/types/notification.types";

import {
  markAllNotificationsAsReadInCache,
  markNotificationAsReadInCache,
  removeNotificationFromCache,
  updateUnreadCount,
  type NotificationInfiniteData,
} from "./notificationCache";

function createNotification(
  id: number,
  overrides: Partial<Notification> = {},
): Notification {
  return {
    id,
    category: "ACTIVITY",
    type: "POSTING",
    message: `notification-${id}`,
    targetType: "POSTING",
    targetId: id,
    targetMeetingId: null,
    thumbnailUrl: null,
    read: false,
    createdAt: "2026-08-16T12:00:00",
    ...overrides,
  };
}

function createPage(content: Notification[], page: number): NotificationPage {
  return {
    content,
    totalElements: 3,
    totalPages: 2,
    page,
    size: 2,
  };
}

function createData(): NotificationInfiniteData {
  return {
    pages: [
      createPage([createNotification(1), createNotification(2)], 0),
      createPage([createNotification(3)], 1),
    ],
    pageParams: [0, 1],
  };
}

describe("notification cache transforms", () => {
  it("대상 알림만 읽음으로 변경한다", () => {
    const result = markNotificationAsReadInCache(createData(), 2);

    expect(
      result?.pages[0]?.content.map((notification) => notification.read),
    ).toEqual([false, true]);
    expect(result?.pages[1]?.content[0]?.read).toBe(false);
  });

  it("여러 페이지의 알림을 모두 읽음으로 변경한다", () => {
    const result = markAllNotificationsAsReadInCache(createData());

    expect(
      result?.pages
        .flatMap((page) => page.content)
        .every((notification) => notification.read),
    ).toBe(true);
  });

  it("알림을 제거하고 페이지 메타데이터를 갱신한다", () => {
    const result = removeNotificationFromCache(createData(), 2);

    expect(
      result?.pages[0]?.content.map((notification) => notification.id),
    ).toEqual([1]);
    expect(result?.pages.map((page) => page.totalElements)).toEqual([2, 2]);
    expect(result?.pages.every((page) => page.totalPages === 1)).toBe(true);
  });

  it("읽지 않은 카운트를 줄이되 음수가 되지 않게 한다", () => {
    const count = { activity: 1, meeting: 0, total: 1 };

    expect(updateUnreadCount(count, "ACTIVITY", 0)).toEqual({
      activity: 0,
      meeting: 0,
      total: 0,
    });
    expect(updateUnreadCount(count, "ACTIVITY", -1)).toEqual({
      activity: 0,
      meeting: 0,
      total: 0,
    });
  });
});
