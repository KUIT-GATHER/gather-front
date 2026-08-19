import { HttpResponse, http } from "msw";

import type {
  Notification,
  NotificationCategory,
  NotificationSettings,
} from "@/features/notification/types/notification.types";
import {
  createUnauthorizedResponse,
  getMockUserId,
} from "@/mocks/lib/mockAuth";
import { getGatherApiUrl } from "./apiScope";

type MockNotification = Notification & {
  userId: number;
  deleted: boolean;
};

const NOTIFICATION_SETTINGS_FIELDS = [
  "volunteerScheduleEnabled",
  "bookmarkedPostingDeadlineEnabled",
  "badgeEnabled",
  "activityPostCommentEnabled",
  "meetingJoinResultEnabled",
  "bookmarkedMeetingDeadlineEnabled",
  "meetingPostCommentEnabled",
] as const;

const initialNotifications: MockNotification[] = [
  {
    id: 1,
    userId: 1,
    category: "ACTIVITY",
    type: "VOLUNTEER_SCHEDULE",
    message:
      "[동화책 같이 읽어요 📖] 봉사가 내일 진행돼요. 시간과 장소를 확인해 주세요.",
    targetType: "POSTING",
    targetId: 1,
    targetMeetingId: null,
    thumbnailUrl: null,
    read: false,
    createdAt: "2026-07-30T02:00:00Z",
    deleted: false,
  },
  {
    id: 2,
    userId: 1,
    category: "ACTIVITY",
    type: "VOLUNTEER_SCHEDULE",
    message:
      "[한강공원 플로깅 🌿] 봉사 일정이 일주일 남았어요. 시간과 장소를 확인해 주세요.",
    targetType: "POSTING",
    targetId: 2,
    targetMeetingId: null,
    thumbnailUrl: null,
    read: false,
    createdAt: "2026-07-29T02:30:00Z",
    deleted: false,
  },
  {
    id: 3,
    userId: 1,
    category: "ACTIVITY",
    type: "BOOKMARKED_POSTING_DEADLINE",
    message:
      "[한강공원 플로깅 🌿] 모집 마감이 얼마 남지 않았어요. 신청을 고민 중이라면 지금 확인해 보세요.",
    targetType: "POSTING",
    targetId: 2,
    targetMeetingId: null,
    thumbnailUrl: null,
    read: true,
    createdAt: "2026-07-28T00:30:00Z",
    deleted: false,
  },
  {
    id: 4,
    userId: 1,
    category: "ACTIVITY",
    type: "BADGE_EARNED",
    message: "새로운 뱃지를 획득했어요. 마이페이지에서 확인해 보세요.",
    targetType: "MY_PAGE",
    targetId: null,
    targetMeetingId: null,
    thumbnailUrl: null,
    read: false,
    createdAt: "2026-07-27T01:00:00Z",
    deleted: false,
  },
  {
    id: 6,
    userId: 1,
    category: "MEETING",
    type: "MEETING_JOIN_APPROVED",
    message:
      "[그린서움 🌿] 모임 가입이 승인되었어요. 지금부터 활동에 참여할 수 있어요.",
    targetType: "MEETING",
    targetId: 1,
    targetMeetingId: null,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=200&q=80",
    read: false,
    createdAt: "2026-07-30T01:30:00Z",
    deleted: false,
  },
  {
    id: 7,
    userId: 1,
    category: "MEETING",
    type: "MEETING_JOIN_REJECTED",
    message: "[주말 책나눔] 모임 가입이 거절되었어요. 다른 모임을 찾아보세요.",
    targetType: "MEETING",
    targetId: 2,
    targetMeetingId: null,
    thumbnailUrl: null,
    read: true,
    createdAt: "2026-07-29T00:20:00Z",
    deleted: false,
  },
  {
    id: 8,
    userId: 1,
    category: "MEETING",
    type: "MEETING_POST_COMMENT",
    message: "[동네한바퀴 봉사단] 작성한 글에 새 댓글이 달렸어요.",
    targetType: "POST",
    targetId: 3,
    targetMeetingId: 1,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=200&q=80",
    read: false,
    createdAt: "2026-07-27T23:30:00Z",
    deleted: false,
  },
  {
    id: 9,
    userId: 1,
    category: "MEETING",
    type: "MEETING_NOTICE_CREATED",
    message: "[벽화 그리기팀]에 새 공지가 등록되었어요.",
    targetType: "POST",
    targetId: 1,
    targetMeetingId: 1,
    thumbnailUrl: null,
    read: true,
    createdAt: "2026-07-27T00:30:00Z",
    deleted: false,
  },
  {
    id: 10,
    userId: 1,
    category: "MEETING",
    type: "MEETING_POSTING_CREATED",
    message: "[그린서움 🌿]에 새 봉사공고가 등록되었어요.",
    targetType: "POST",
    targetId: 5,
    targetMeetingId: 1,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1531481540919-6a67ca4ec1a3?auto=format&fit=crop&w=200&q=80",
    read: false,
    createdAt: "2026-07-26T04:00:00Z",
    deleted: false,
  },
  {
    id: 11,
    userId: 1,
    category: "MEETING",
    type: "MEETING_POST_CREATED",
    message: "[그린서움 🌿]에 [이가더]님이 새 게시글을 등록했어요.",
    targetType: "POST",
    targetId: 3,
    targetMeetingId: 1,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=200&q=80",
    read: true,
    createdAt: "2026-07-25T09:10:00Z",
    deleted: false,
  },
  {
    id: 12,
    userId: 1,
    category: "MEETING",
    type: "MEETING_BOOKMARKED_DEADLINE",
    message:
      "[주말 책나눔] 팀 모집 마감이 얼마 남지 않았어요. 참여를 고민 중이라면 지금 확인해 보세요.",
    targetType: "MEETING",
    targetId: 2,
    targetMeetingId: null,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=200&q=80",
    read: false,
    createdAt: "2026-07-24T06:00:00Z",
    deleted: false,
  },
];

const generatedActivityNotifications = Array.from(
  { length: 16 },
  (_, index) => ({
    id: index + 13,
    userId: 1,
    category: "ACTIVITY" as const,
    type: "VOLUNTEER_SCHEDULE",
    message: `[환경 정화 봉사 ${index + 1}] 봉사 일정이 일주일 남았어요. 시간과 장소를 확인해 주세요.`,
    targetType: "POSTING" as const,
    targetId: (index % 2) + 1,
    targetMeetingId: null,
    thumbnailUrl: null,
    read: index % 3 === 0,
    createdAt: `2026-07-${String(24 - index).padStart(2, "0")}T00:00:00Z`,
    deleted: false,
  }),
);

let notifications: MockNotification[] = [
  ...initialNotifications,
  ...generatedActivityNotifications,
];

let notificationSettings: NotificationSettings = {
  volunteerScheduleEnabled: true,
  bookmarkedPostingDeadlineEnabled: false,
  badgeEnabled: false,
  activityPostCommentEnabled: false,
  meetingJoinResultEnabled: true,
  bookmarkedMeetingDeadlineEnabled: false,
  meetingPostCommentEnabled: false,
};

function createErrorResponse(
  code: "VALIDATION_ERROR" | "NOTIFICATION_NOT_FOUND",
  message: string,
  status: number,
) {
  return HttpResponse.json(
    {
      success: false,
      data: null,
      error: { code, message },
    },
    { status },
  );
}

function isNotificationCategory(
  value: string | null,
): value is NotificationCategory {
  return value === "ACTIVITY" || value === "MEETING";
}

function getPositiveInteger(value: string | null, fallback: number) {
  if (value === null || value.trim() === "") {
    return fallback;
  }

  const parsedValue = Number(value);

  return Number.isInteger(parsedValue) && parsedValue >= 0
    ? parsedValue
    : undefined;
}

function toNotificationResponse(notification: MockNotification): Notification {
  return {
    id: notification.id,
    category: notification.category,
    type: notification.type,
    message: notification.message,
    targetType: notification.targetType,
    targetId: notification.targetId,
    targetMeetingId: notification.targetMeetingId,
    thumbnailUrl: notification.thumbnailUrl,
    read: notification.read,
    createdAt: notification.createdAt,
  };
}

function findNotification(userId: number, notificationId: number) {
  return notifications.find(
    (notification) =>
      notification.id === notificationId &&
      notification.userId === userId &&
      !notification.deleted,
  );
}

function isNotificationSettings(value: unknown): value is NotificationSettings {
  if (!value || typeof value !== "object") {
    return false;
  }

  const settings = value as Record<string, unknown>;

  return NOTIFICATION_SETTINGS_FIELDS.every(
    (field) => typeof settings[field] === "boolean",
  );
}

export const notificationHandlers = [
  http.get(getGatherApiUrl("/api/v1/notifications"), ({ request }) => {
    const userId = getMockUserId(request);

    if (userId === null) {
      return createUnauthorizedResponse();
    }

    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const page = getPositiveInteger(url.searchParams.get("page"), 0);
    const size = getPositiveInteger(url.searchParams.get("size"), 20);
    const sort = url.searchParams.get("sort");

    if (!isNotificationCategory(category) || page === undefined || !size) {
      return createErrorResponse(
        "VALIDATION_ERROR",
        "요청 값이 올바르지 않습니다.",
        400,
      );
    }

    if (sort && sort !== "createdAt,desc") {
      return createErrorResponse(
        "VALIDATION_ERROR",
        "정렬 값이 올바르지 않습니다.",
        400,
      );
    }

    const filteredNotifications = notifications
      .filter(
        (notification) =>
          notification.userId === userId &&
          notification.category === category &&
          !notification.deleted,
      )
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    const totalElements = filteredNotifications.length;
    const totalPages = Math.ceil(totalElements / size);
    const content = filteredNotifications
      .slice(page * size, page * size + size)
      .map(toNotificationResponse);

    return HttpResponse.json({
      success: true,
      data: { content, totalElements, totalPages, page, size },
      error: null,
    });
  }),

  http.patch(
    getGatherApiUrl("/api/v1/notifications/read-all"),
    ({ request }) => {
      const userId = getMockUserId(request);

      if (userId === null) {
        return createUnauthorizedResponse();
      }

      const category = new URL(request.url).searchParams.get("category");

      if (!isNotificationCategory(category)) {
        return createErrorResponse(
          "VALIDATION_ERROR",
          "요청 값이 올바르지 않습니다.",
          400,
        );
      }

      notifications = notifications.map((notification) =>
        notification.userId === userId &&
        notification.category === category &&
        !notification.deleted
          ? { ...notification, read: true }
          : notification,
      );

      return HttpResponse.json({ success: true, data: null, error: null });
    },
  ),

  http.patch(
    getGatherApiUrl("/api/v1/notifications/:notificationId/read"),
    ({ params, request }) => {
      const userId = getMockUserId(request);

      if (userId === null) {
        return createUnauthorizedResponse();
      }

      const notification = findNotification(
        userId,
        Number(params.notificationId),
      );

      if (!notification) {
        return createErrorResponse(
          "NOTIFICATION_NOT_FOUND",
          "알림을 찾을 수 없습니다.",
          404,
        );
      }

      notification.read = true;

      return HttpResponse.json({
        success: true,
        data: toNotificationResponse(notification),
        error: null,
      });
    },
  ),

  http.delete(
    getGatherApiUrl("/api/v1/notifications/:notificationId"),
    ({ params, request }) => {
      const userId = getMockUserId(request);

      if (userId === null) {
        return createUnauthorizedResponse();
      }

      const notification = findNotification(
        userId,
        Number(params.notificationId),
      );

      if (!notification) {
        return createErrorResponse(
          "NOTIFICATION_NOT_FOUND",
          "알림을 찾을 수 없습니다.",
          404,
        );
      }

      notification.deleted = true;

      return HttpResponse.json({ success: true, data: null, error: null });
    },
  ),

  http.get(getGatherApiUrl("/api/v1/notifications/settings"), ({ request }) => {
    if (getMockUserId(request) === null) {
      return createUnauthorizedResponse();
    }

    return HttpResponse.json({
      success: true,
      data: notificationSettings,
      error: null,
    });
  }),

  http.put(
    getGatherApiUrl("/api/v1/notifications/settings"),
    async ({ request }) => {
      if (getMockUserId(request) === null) {
        return createUnauthorizedResponse();
      }

      const settings = await request.json();

      if (!isNotificationSettings(settings)) {
        return createErrorResponse(
          "VALIDATION_ERROR",
          "알림 설정의 모든 항목을 boolean으로 전달해 주세요.",
          400,
        );
      }

      notificationSettings = {
        volunteerScheduleEnabled: settings.volunteerScheduleEnabled,
        bookmarkedPostingDeadlineEnabled:
          settings.bookmarkedPostingDeadlineEnabled,
        badgeEnabled: settings.badgeEnabled,
        activityPostCommentEnabled: settings.activityPostCommentEnabled,
        meetingJoinResultEnabled: settings.meetingJoinResultEnabled,
        bookmarkedMeetingDeadlineEnabled:
          settings.bookmarkedMeetingDeadlineEnabled,
        meetingPostCommentEnabled: settings.meetingPostCommentEnabled,
      };

      return HttpResponse.json({
        success: true,
        data: notificationSettings,
        error: null,
      });
    },
  ),

  http.get(
    getGatherApiUrl("/api/v1/notifications/unread-count"),
    ({ request }) => {
      const userId = getMockUserId(request);

      if (userId === null) {
        return createUnauthorizedResponse();
      }

      const activity = notifications.filter(
        (notification) =>
          notification.userId === userId &&
          notification.category === "ACTIVITY" &&
          !notification.read &&
          !notification.deleted,
      ).length;
      const meeting = notifications.filter(
        (notification) =>
          notification.userId === userId &&
          notification.category === "MEETING" &&
          !notification.read &&
          !notification.deleted,
      ).length;

      return HttpResponse.json({
        success: true,
        data: { activity, meeting, total: activity + meeting },
        error: null,
      });
    },
  ),
];
