import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import {
  getNotificationSettings,
  getNotifications,
  getUnreadNotificationCount,
} from "@/features/notification/api/notification.api";

import type { NotificationCategory } from "@/features/notification/types/notification.types";

const NOTIFICATION_PAGE_SIZE = 20;
const NOTIFICATION_REFETCH_INTERVAL = 30_000;

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  infinite: (category: NotificationCategory) =>
    [...notificationKeys.lists(), "infinite", category] as const,
  settings: () => [...notificationKeys.all, "settings"] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};

export const notificationQueries = {
  infiniteList: (category: NotificationCategory) =>
    infiniteQueryOptions({
      queryKey: notificationKeys.infinite(category),
      initialPageParam: 0,
      queryFn: ({ pageParam }) =>
        getNotifications({
          category,
          page: pageParam,
          size: NOTIFICATION_PAGE_SIZE,
        }),
      getNextPageParam: (lastPage) => {
        const nextPage = lastPage.page + 1;

        return nextPage < lastPage.totalPages ? nextPage : undefined;
      },
      refetchOnWindowFocus: true,
    }),

  settings: (enabled: boolean) =>
    queryOptions({
      queryKey: notificationKeys.settings(),
      queryFn: getNotificationSettings,
      enabled,
    }),

  unreadCount: () =>
    queryOptions({
      queryKey: notificationKeys.unreadCount(),
      queryFn: getUnreadNotificationCount,
      refetchInterval: NOTIFICATION_REFETCH_INTERVAL,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: true,
    }),
};
