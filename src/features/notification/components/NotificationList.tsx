import { useEffect, useRef } from "react";
import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";

import { NotificationItem } from "@/features/notification/components/NotificationItem";
import { SwipeActionRow } from "@/features/notification/components/SwipeActionRow";
import type {
  Notification,
  NotificationPage,
} from "@/features/notification/types/notification.types";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";

type NotificationListProps = {
  query: UseInfiniteQueryResult<InfiniteData<NotificationPage>, unknown>;
  openNotificationId: number | null;
  onOpenNotificationChange: (notificationId: number | null) => void;
  onNotificationClick: (notification: Notification) => void;
  onDelete: (notification: Notification) => void;
  isReadAllPending: boolean;
  readPendingNotificationId: number | null;
  deletePendingNotificationId: number | null;
};

export function NotificationList({
  query,
  openNotificationId,
  onOpenNotificationChange,
  onNotificationClick,
  onDelete,
  isReadAllPending,
  readPendingNotificationId,
  deletePendingNotificationId,
}: NotificationListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchNextPageError,
    isFetchingNextPage,
    isLoading,
    isSuccess,
    refetch,
  } = query;
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const notifications = data?.pages.flatMap((page) => page.content) ?? [];

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          !isFetchNextPageError
        ) {
          void fetchNextPage();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError]);

  const isInitialLoading = isLoading && notifications.length === 0;
  const isInitialError = isError && notifications.length === 0;

  if (isInitialLoading) {
    return <LoadingState label="알림을 불러오는 중" className="min-h-55" />;
  }

  if (isInitialError) {
    return (
      <ErrorState
        title="알림을 불러오지 못했어요"
        description="잠시 후 다시 확인해 주세요."
        primaryAction={{
          label: "다시 시도",
          onClick: () => {
            void refetch();
          },
        }}
        className="pt-16"
      />
    );
  }

  if (isSuccess && notifications.length === 0) {
    return (
      <div className="flex min-h-[calc(100dvh-12rem)] items-center justify-center">
        <p className="text-body-14 text-text-gray-100">알림 없음</p>
      </div>
    );
  }

  return (
    <>
      <ul id="notification-list" role="tabpanel" className="-mx-5.5">
        {notifications.map((notification) => (
          <li key={notification.id} className="border-b border-stroke/70">
            <SwipeActionRow
              open={openNotificationId === notification.id}
              onOpenChange={(open) =>
                onOpenNotificationChange(open ? notification.id : null)
              }
              onDelete={() => onDelete(notification)}
              deleteDisabled={
                isReadAllPending ||
                deletePendingNotificationId === notification.id
              }
            >
              <NotificationItem
                notification={notification}
                disabled={
                  isReadAllPending ||
                  readPendingNotificationId === notification.id
                }
                onClick={() => onNotificationClick(notification)}
              />
            </SwipeActionRow>
          </li>
        ))}
      </ul>

      <div ref={loadMoreRef} aria-hidden="true" className="h-1" />
      {isFetchingNextPage ? (
        <LoadingState label="알림을 더 불러오는 중" className="min-h-24" />
      ) : null}
      {isFetchNextPageError ? (
        <div className="py-6 text-center">
          <p className="text-sm text-text-gray-400">
            알림을 더 불러오지 못했어요.
          </p>
          <button
            type="button"
            className="mt-2 rounded-lg px-3 py-2 text-sm font-medium text-button focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
            onClick={() => void fetchNextPage()}
          >
            다시 시도
          </button>
        </div>
      ) : null}
    </>
  );
}
