import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import {
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  updateNotificationSettings,
} from "@/features/notification/api/notification.api";
import { notificationKeys } from "@/features/notification/api/notification.queries";
import {
  markAllNotificationsAsReadInCache,
  markNotificationAsReadInCache,
  removeNotificationFromCache,
  updateUnreadCount,
  type NotificationInfiniteData,
} from "@/features/notification/lib/notificationCache";

import type {
  Notification,
  NotificationCategory,
  NotificationSettings,
  NotificationUnreadCount,
} from "@/features/notification/types/notification.types";

type NotificationMutationContext = {
  notifications: NotificationInfiniteData | undefined;
  unreadCount: NotificationUnreadCount | undefined;
};

function unreadCategoryKey(category: NotificationCategory) {
  return category === "ACTIVITY" ? "activity" : "meeting";
}

function invalidateNotificationData(
  queryClient: QueryClient,
  category: NotificationCategory,
) {
  void queryClient.invalidateQueries({
    queryKey: notificationKeys.infinite(category),
  });
  void queryClient.invalidateQueries({
    queryKey: notificationKeys.unreadCount(),
  });
}

export function useReadNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...notificationKeys.all, "read"] as const,
    mutationFn: (notification: Notification) =>
      markNotificationAsRead(notification.id),
    onMutate: async (notification): Promise<NotificationMutationContext> => {
      const notificationsKey = notificationKeys.infinite(notification.category);
      const unreadCountQueryKey = notificationKeys.unreadCount();

      await queryClient.cancelQueries({ queryKey: notificationsKey });
      await queryClient.cancelQueries({ queryKey: unreadCountQueryKey });

      const notifications =
        queryClient.getQueryData<NotificationInfiniteData>(notificationsKey);
      const unreadCount =
        queryClient.getQueryData<NotificationUnreadCount>(unreadCountQueryKey);

      queryClient.setQueryData(
        notificationsKey,
        markNotificationAsReadInCache(notifications, notification.id),
      );

      if (!notification.read) {
        const categoryKey = unreadCategoryKey(notification.category);
        queryClient.setQueryData(
          unreadCountQueryKey,
          updateUnreadCount(
            unreadCount,
            notification.category,
            (unreadCount?.[categoryKey] ?? 0) - 1,
          ),
        );
      }

      return { notifications, unreadCount };
    },
    onError: (_error, notification, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData(
        notificationKeys.infinite(notification.category),
        context.notifications,
      );
      queryClient.setQueryData(
        notificationKeys.unreadCount(),
        context.unreadCount,
      );
    },
    onSettled: (_data, _error, notification) => {
      invalidateNotificationData(queryClient, notification.category);
    },
  });
}

export function useReadAllNotificationsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...notificationKeys.all, "read-all"] as const,
    mutationFn: (category: NotificationCategory) =>
      markAllNotificationsAsRead(category),
    onMutate: async (category): Promise<NotificationMutationContext> => {
      const notificationsKey = notificationKeys.infinite(category);
      const unreadCountQueryKey = notificationKeys.unreadCount();

      await queryClient.cancelQueries({ queryKey: notificationsKey });
      await queryClient.cancelQueries({ queryKey: unreadCountQueryKey });

      const notifications =
        queryClient.getQueryData<NotificationInfiniteData>(notificationsKey);
      const unreadCount =
        queryClient.getQueryData<NotificationUnreadCount>(unreadCountQueryKey);

      queryClient.setQueryData(
        notificationsKey,
        markAllNotificationsAsReadInCache(notifications),
      );
      queryClient.setQueryData(
        unreadCountQueryKey,
        updateUnreadCount(unreadCount, category, 0),
      );

      return { notifications, unreadCount };
    },
    onError: (_error, category, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData(
        notificationKeys.infinite(category),
        context.notifications,
      );
      queryClient.setQueryData(
        notificationKeys.unreadCount(),
        context.unreadCount,
      );
    },
    onSettled: (_data, _error, category) => {
      invalidateNotificationData(queryClient, category);
    },
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...notificationKeys.all, "delete"] as const,
    mutationFn: (notification: Notification) =>
      deleteNotification(notification.id),
    onMutate: async (notification): Promise<NotificationMutationContext> => {
      const notificationsKey = notificationKeys.infinite(notification.category);
      const unreadCountQueryKey = notificationKeys.unreadCount();

      await queryClient.cancelQueries({ queryKey: notificationsKey });
      await queryClient.cancelQueries({ queryKey: unreadCountQueryKey });

      const notifications =
        queryClient.getQueryData<NotificationInfiniteData>(notificationsKey);
      const unreadCount =
        queryClient.getQueryData<NotificationUnreadCount>(unreadCountQueryKey);

      queryClient.setQueryData(
        notificationsKey,
        removeNotificationFromCache(notifications, notification.id),
      );

      if (!notification.read) {
        const categoryKey = unreadCategoryKey(notification.category);
        queryClient.setQueryData(
          unreadCountQueryKey,
          updateUnreadCount(
            unreadCount,
            notification.category,
            (unreadCount?.[categoryKey] ?? 0) - 1,
          ),
        );
      }

      return { notifications, unreadCount };
    },
    onError: (_error, notification, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData(
        notificationKeys.infinite(notification.category),
        context.notifications,
      );
      queryClient.setQueryData(
        notificationKeys.unreadCount(),
        context.unreadCount,
      );
    },
    onSettled: (_data, _error, notification) => {
      invalidateNotificationData(queryClient, notification.category);
    },
  });
}

export function useUpdateNotificationSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...notificationKeys.settings(), "update"] as const,
    mutationFn: updateNotificationSettings,
    onMutate: async (settings): Promise<NotificationSettings | undefined> => {
      const settingsKey = notificationKeys.settings();

      await queryClient.cancelQueries({ queryKey: settingsKey });

      const previousSettings =
        queryClient.getQueryData<NotificationSettings>(settingsKey);
      queryClient.setQueryData(settingsKey, settings);

      return previousSettings;
    },
    onError: (_error, _settings, previousSettings) => {
      queryClient.setQueryData(notificationKeys.settings(), previousSettings);
    },
    onSuccess: (settings) => {
      queryClient.setQueryData(notificationKeys.settings(), settings);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.settings(),
      });
    },
  });
}
