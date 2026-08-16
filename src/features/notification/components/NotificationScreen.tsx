import { useEffect, useRef, useState } from "react";
import { Settings } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router";

import { notificationKeys } from "@/features/notification/api/notification.queries";
import { NotificationList } from "@/features/notification/components/NotificationList";
import { NotificationSettingsSheet } from "@/features/notification/components/NotificationSettingsSheet";
import { NotificationTabs } from "@/features/notification/components/NotificationTabs";
import { useInfiniteNotificationsQuery } from "@/features/notification/hooks/useInfiniteNotificationsQuery";
import {
  useDeleteNotificationMutation,
  useReadAllNotificationsMutation,
  useReadNotificationMutation,
} from "@/features/notification/hooks/useNotificationMutations";
import { useUnreadNotificationCountQuery } from "@/features/notification/hooks/useUnreadNotificationCountQuery";
import { getNotificationTargetPath } from "@/features/notification/lib/notificationTargetPath";
import type {
  Notification,
  NotificationCategory,
  NotificationUnreadCount,
} from "@/features/notification/types/notification.types";
import IconButton from "@/shared/ui/IconButton";
import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";

function getNotificationCategory(value: string | null): NotificationCategory {
  return value === "MEETING" ? "MEETING" : "ACTIVITY";
}

export function NotificationScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [openNotificationId, setOpenNotificationId] = useState<number | null>(
    null,
  );
  const category = getNotificationCategory(searchParams.get("category"));
  const notificationsQuery = useInfiniteNotificationsQuery(category);
  const unreadCountQuery = useUnreadNotificationCountQuery();
  const readMutation = useReadNotificationMutation();
  const readAllMutation = useReadAllNotificationsMutation();
  const deleteMutation = useDeleteNotificationMutation();
  const previousUnreadCountRef = useRef<NotificationUnreadCount | undefined>(
    undefined,
  );
  const notifications =
    notificationsQuery.data?.pages.flatMap((page) => page.content) ?? [];
  const unreadInCurrentCategory =
    unreadCountQuery.data?.[category === "ACTIVITY" ? "activity" : "meeting"] ??
    notifications.filter((notification) => !notification.read).length;
  const readPendingNotificationId = readMutation.isPending
    ? (readMutation.variables?.id ?? null)
    : null;
  const deletePendingNotificationId = deleteMutation.isPending
    ? (deleteMutation.variables?.id ?? null)
    : null;
  const isNotificationMutationPending =
    readMutation.isPending ||
    readAllMutation.isPending ||
    deleteMutation.isPending;

  useEffect(() => {
    const unreadCount = unreadCountQuery.data;

    if (!unreadCount) {
      return;
    }

    const previousUnreadCount = previousUnreadCountRef.current;
    previousUnreadCountRef.current = unreadCount;

    if (isNotificationMutationPending) {
      return;
    }

    const countKey = category === "ACTIVITY" ? "activity" : "meeting";

    if (
      !previousUnreadCount ||
      previousUnreadCount[countKey] === unreadCount[countKey]
    ) {
      return;
    }

    void queryClient.invalidateQueries({
      queryKey: notificationKeys.infinite(category),
    });
  }, [
    category,
    isNotificationMutationPending,
    queryClient,
    unreadCountQuery.data,
  ]);

  const changeCategory = (nextCategory: NotificationCategory) => {
    const nextSearchParams = new URLSearchParams(searchParams);

    nextSearchParams.set("category", nextCategory);
    setSearchParams(nextSearchParams);
    setOpenNotificationId(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    const targetPath = getNotificationTargetPath(notification);

    if (notification.read) {
      if (targetPath) {
        navigate(targetPath);
      }

      return;
    }

    readMutation.mutate(notification);

    if (targetPath) {
      navigate(targetPath);
    }
  };

  const handleDelete = (notification: Notification) => {
    setOpenNotificationId(null);
    deleteMutation.mutate(notification);
  };

  return (
    <>
      <div className="sticky top-0 z-40 bg-bg">
        <PageContainer size="narrow">
          <PageHeader
            title="알림"
            onBack={() => navigate(-1)}
            className="[&_h1]:ml-2.5"
            rightAction={
              <IconButton
                label="알림 설정 열기"
                icon={<Settings />}
                className="-mr-3"
                onClick={() => setIsSettingsOpen(true)}
              />
            }
          />
        </PageContainer>
      </div>

      <PageContainer size="narrow" className="min-h-dvh pb-8">
        <NotificationTabs category={category} onChange={changeCategory} />

        {notifications.length > 0 ? (
          <div className="-mx-5.5 flex h-11 items-center justify-end px-5.5">
            <button
              type="button"
              className="min-h-11 text-xs leading-5 font-semibold text-text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40 disabled:cursor-not-allowed disabled:text-text-gray-100"
              disabled={
                unreadInCurrentCategory === 0 ||
                readAllMutation.isPending ||
                readMutation.isPending ||
                deleteMutation.isPending
              }
              onClick={() => readAllMutation.mutate(category)}
            >
              전체 읽음
            </button>
          </div>
        ) : null}

        <NotificationList
          query={notificationsQuery}
          openNotificationId={openNotificationId}
          onOpenNotificationChange={setOpenNotificationId}
          onNotificationClick={handleNotificationClick}
          onDelete={handleDelete}
          isReadAllPending={readAllMutation.isPending}
          readPendingNotificationId={readPendingNotificationId}
          deletePendingNotificationId={deletePendingNotificationId}
        />

        <NotificationSettingsSheet
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
        />
      </PageContainer>
    </>
  );
}
