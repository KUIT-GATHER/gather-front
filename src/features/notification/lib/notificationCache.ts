import type { InfiniteData } from "@tanstack/react-query";

import type {
  NotificationPage,
  NotificationUnreadCount,
} from "@/features/notification/types/notification.types";

export type NotificationInfiniteData = InfiniteData<NotificationPage>;

function getUpdatedTotalPages(totalElements: number, size: number) {
  return totalElements === 0 ? 0 : Math.ceil(totalElements / size);
}

export function markNotificationAsReadInCache(
  data: NotificationInfiniteData | undefined,
  notificationId: number,
) {
  if (!data) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      content: page.content.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification,
      ),
    })),
  };
}

export function markAllNotificationsAsReadInCache(
  data: NotificationInfiniteData | undefined,
) {
  if (!data) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      content: page.content.map((notification) => ({
        ...notification,
        read: true,
      })),
    })),
  };
}

export function removeNotificationFromCache(
  data: NotificationInfiniteData | undefined,
  notificationId: number,
) {
  if (!data) {
    return data;
  }

  const hasNotification = data.pages.some((page) =>
    page.content.some((notification) => notification.id === notificationId),
  );

  if (!hasNotification) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map((page) => {
      const totalElements = Math.max(0, page.totalElements - 1);

      return {
        ...page,
        totalElements,
        totalPages: getUpdatedTotalPages(totalElements, page.size),
        content: page.content.filter(
          (notification) => notification.id !== notificationId,
        ),
      };
    }),
  };
}

export function getCachedUnreadNotificationCount(
  data: NotificationInfiniteData | undefined,
) {
  return (
    data?.pages.reduce(
      (count, page) =>
        count +
        page.content.filter((notification) => !notification.read).length,
      0,
    ) ?? 0
  );
}

export function updateUnreadCount(
  count: NotificationUnreadCount | undefined,
  category: "ACTIVITY" | "MEETING",
  nextCategoryCount: number,
) {
  if (!count) {
    return count;
  }

  const currentCategoryCount =
    category === "ACTIVITY" ? count.activity : count.meeting;
  const normalizedCategoryCount = Math.max(0, nextCategoryCount);

  return {
    ...count,
    [category === "ACTIVITY" ? "activity" : "meeting"]: normalizedCategoryCount,
    total: Math.max(
      0,
      count.total - currentCategoryCount + normalizedCategoryCount,
    ),
  };
}
