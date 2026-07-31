import { useQuery } from "@tanstack/react-query";

import { notificationQueries } from "@/features/notification/api/notification.queries";

export function useNotificationSettingsQuery(enabled: boolean) {
  return useQuery(notificationQueries.settings(enabled));
}
