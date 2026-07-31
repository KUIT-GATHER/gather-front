import { useInfiniteQuery } from "@tanstack/react-query";

import { notificationQueries } from "@/features/notification/api/notification.queries";

import type { NotificationCategory } from "@/features/notification/types/notification.types";

export function useInfiniteNotificationsQuery(category: NotificationCategory) {
  return useInfiniteQuery(notificationQueries.infiniteList(category));
}
