import { describe, expect, it } from "vitest";

import type { Notification } from "@/features/notification/types/notification.types";

import { getNotificationTargetPath } from "./notificationTargetPath";

function notification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 1,
    category: "ACTIVITY",
    type: "VOLUNTEER_SCHEDULE",
    message: "알림",
    targetType: "POSTING",
    targetId: 1,
    targetMeetingId: null,
    thumbnailUrl: null,
    read: false,
    createdAt: "2026-08-16T12:00:00",
    ...overrides,
  };
}

describe("getNotificationTargetPath", () => {
  it.each([
    [
      "POSTING",
      notification({ targetType: "POSTING", targetId: 12 }),
      "/volunteers/12",
    ],
    [
      "MEETING",
      notification({ targetType: "MEETING", targetId: 34 }),
      "/teams/34",
    ],
    [
      "BADGE_EARNED",
      notification({ targetType: "MY_PAGE", type: "BADGE_EARNED" }),
      "/my/badges",
    ],
    [
      "POST",
      notification({ targetType: "POST", targetId: 56, targetMeetingId: 78 }),
      "/teams/78/posts/56",
    ],
  ])("%s 알림의 이동 경로를 만든다", (_name, value, expected) => {
    expect(getNotificationTargetPath(value)).toBe(expected);
  });

  it("대상 ID가 없거나 알 수 없는 유형이면 이동하지 않는다", () => {
    expect(
      getNotificationTargetPath(
        notification({
          targetType: "POST",
          targetId: null,
          targetMeetingId: 1,
        }),
      ),
    ).toBeNull();
    expect(
      getNotificationTargetPath(notification({ targetType: "UNKNOWN" })),
    ).toBeNull();
  });
});
