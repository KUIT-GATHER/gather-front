import { useQuery } from "@tanstack/react-query";

import { notificationQueries } from "@/features/notification/api/notification.queries";

export function useNotificationSettingsQuery() {
  return useQuery(notificationQueries.settings());
}
