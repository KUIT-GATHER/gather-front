import { fetchClient } from "@/shared/api/fetchClient";

import type {
  Notification,
  NotificationCategory,
  NotificationPage,
  NotificationSettings,
  NotificationUnreadCount,
} from "@/features/notification/types/notification.types";

const NOTIFICATION_ENDPOINT = "/api/v1/notifications";

type GetNotificationsParams = {
  category: NotificationCategory;
  page?: number;
  size?: number;
  sort?: string;
};

function buildNotificationsEndpoint({
  category,
  page = 0,
  size = 20,
  sort = "createdAt,desc",
}: GetNotificationsParams) {
  const searchParams = new URLSearchParams({
    category,
    page: String(page),
    size: String(size),
    sort,
  });

  return `${NOTIFICATION_ENDPOINT}?${searchParams.toString()}`;
}

export function getNotifications(params: GetNotificationsParams) {
  return fetchClient<NotificationPage>(buildNotificationsEndpoint(params));
}

export function markNotificationAsRead(notificationId: number) {
  return fetchClient<Notification>(
    `${NOTIFICATION_ENDPOINT}/${notificationId}/read`,
    { method: "PATCH" },
  );
}

export function markAllNotificationsAsRead(category: NotificationCategory) {
  const searchParams = new URLSearchParams({ category });

  return fetchClient<void>(
    `${NOTIFICATION_ENDPOINT}/read-all?${searchParams.toString()}`,
    { method: "PATCH" },
  );
}

export function deleteNotification(notificationId: number) {
  return fetchClient<void>(`${NOTIFICATION_ENDPOINT}/${notificationId}`, {
    method: "DELETE",
  });
}

export function getNotificationSettings() {
  return fetchClient<NotificationSettings>(`${NOTIFICATION_ENDPOINT}/settings`);
}

export function updateNotificationSettings(settings: NotificationSettings) {
  return fetchClient<NotificationSettings>(
    `${NOTIFICATION_ENDPOINT}/settings`,
    {
      method: "PUT",
      body: JSON.stringify(settings),
    },
  );
}

export function getUnreadNotificationCount() {
  return fetchClient<NotificationUnreadCount>(
    `${NOTIFICATION_ENDPOINT}/unread-count`,
  );
}
