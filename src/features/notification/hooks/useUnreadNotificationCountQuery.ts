import { useQuery } from "@tanstack/react-query";

import { notificationQueries } from "@/features/notification/api/notification.queries";

export function useUnreadNotificationCountQuery(enabled = true) {
  return useQuery({
    ...notificationQueries.unreadCount(),
    enabled,
  });
}
