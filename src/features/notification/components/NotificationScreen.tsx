import { useState } from "react";
import { Settings } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";

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
} from "@/features/notification/types/notification.types";
import IconButton from "@/shared/ui/IconButton";
import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";

function getNotificationCategory(value: string | null): NotificationCategory {
  return value === "MEETING" ? "MEETING" : "ACTIVITY";
}

export function NotificationScreen() {
  const navigate = useNavigate();
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
  const notifications =
    notificationsQuery.data?.pages.flatMap((page) => page.content) ?? [];
  const unreadInCurrentCategory =
    unreadCountQuery.data?.[category === "ACTIVITY" ? "activity" : "meeting"] ??
    notifications.filter((notification) => !notification.read).length;
  const isListMutationPending =
    readMutation.isPending ||
    readAllMutation.isPending ||
    deleteMutation.isPending;

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

    readMutation.mutate(notification, {
      onSettled: () => {
        if (targetPath) {
          navigate(targetPath);
        }
      },
    });
  };

  const handleDelete = (notification: Notification) => {
    setOpenNotificationId(null);
    deleteMutation.mutate(notification);
  };

  return (
    <PageContainer size="narrow" className="min-h-dvh pb-8">
      <PageHeader
        sticky
        title="알림"
        onBack={() => navigate(-1)}
        rightAction={
          <IconButton
            label="알림 설정 열기"
            icon={<Settings />}
            onClick={() => setIsSettingsOpen(true)}
          />
        }
      />

      <NotificationTabs category={category} onChange={changeCategory} />

      {notifications.length > 0 ? (
        <div className="-mx-5.5 flex h-12 items-center justify-end px-5.5">
          <button
            type="button"
            className="min-h-11 px-3 text-body-14 text-text-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40 disabled:cursor-not-allowed disabled:text-text-gray-100"
            disabled={unreadInCurrentCategory === 0 || isListMutationPending}
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
        isMutationPending={isListMutationPending}
      />

      <NotificationSettingsSheet
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </PageContainer>
  );
}
