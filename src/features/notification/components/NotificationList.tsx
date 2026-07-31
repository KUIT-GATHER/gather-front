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
  readPendingId: number | null;
  deletePendingId: number | null;
};

export function NotificationList({
  query,
  openNotificationId,
  onOpenNotificationChange,
  onNotificationClick,
  onDelete,
  readPendingId,
  deletePendingId,
}: NotificationListProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const notifications = query.data?.pages.flatMap((page) => page.content) ?? [];

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          query.hasNextPage &&
          !query.isFetchingNextPage &&
          !query.isFetchNextPageError
        ) {
          void query.fetchNextPage();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [query]);

  const isInitialLoading = query.isLoading && notifications.length === 0;
  const isInitialError = query.isError && notifications.length === 0;

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
            void query.refetch();
          },
        }}
        className="pt-16"
      />
    );
  }

  if (query.isSuccess && notifications.length === 0) {
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
              deleteDisabled={deletePendingId === notification.id}
            >
              <NotificationItem
                notification={notification}
                disabled={readPendingId === notification.id}
                onClick={() => onNotificationClick(notification)}
              />
            </SwipeActionRow>
          </li>
        ))}
      </ul>

      <div ref={loadMoreRef} aria-hidden="true" className="h-1" />
      {query.isFetchingNextPage ? (
        <LoadingState label="알림을 더 불러오는 중" className="min-h-24" />
      ) : null}
      {query.isFetchNextPageError ? (
        <div className="py-6 text-center">
          <p className="text-sm text-text-gray-400">
            알림을 더 불러오지 못했어요.
          </p>
          <button
            type="button"
            className="mt-2 rounded-lg px-3 py-2 text-sm font-medium text-button focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
            onClick={() => void query.fetchNextPage()}
          >
            다시 시도
          </button>
        </div>
      ) : null}
    </>
  );
}
