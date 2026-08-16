import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { type ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { notificationKeys } from "@/features/notification/api/notification.queries";
import { useDeleteNotificationMutation } from "@/features/notification/hooks/useNotificationMutations";
import type { Notification } from "@/features/notification/types/notification.types";
import { server } from "@/mocks/server";
import { createTestQueryClient } from "@/test/createTestQueryClient";

function createNotification(): Notification {
  return {
    id: 99,
    category: "ACTIVITY",
    type: "POSTING",
    message: "삭제할 알림",
    targetType: "POSTING",
    targetId: 1,
    targetMeetingId: null,
    thumbnailUrl: null,
    read: false,
    createdAt: "2026-08-16T12:00:00",
  };
}

function createCachedData(notification: Notification) {
  return {
    pages: [
      {
        content: [notification],
        totalElements: 1,
        totalPages: 1,
        page: 0,
        size: 20,
      },
    ],
    pageParams: [0],
  };
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useDeleteNotificationMutation", () => {
  it("성공하면 목록과 읽지 않은 카운트를 낙관적으로 갱신한다", async () => {
    const queryClient = createTestQueryClient();
    const notification = createNotification();
    queryClient.setQueryData(
      notificationKeys.infinite("ACTIVITY"),
      createCachedData(notification),
    );
    queryClient.setQueryData(notificationKeys.unreadCount(), {
      activity: 1,
      meeting: 0,
      total: 1,
    });
    server.use(
      http.delete("*/api/v1/notifications/99", () =>
        HttpResponse.json({ success: true, data: null, error: null }),
      ),
    );

    const { result } = renderHook(() => useDeleteNotificationMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutateAsync(notification);

    expect(
      queryClient.getQueryData(notificationKeys.infinite("ACTIVITY")),
    ).toMatchObject({ pages: [{ content: [] }] });
    expect(queryClient.getQueryData(notificationKeys.unreadCount())).toEqual({
      activity: 0,
      meeting: 0,
      total: 0,
    });
  });

  it("실패하면 목록과 읽지 않은 카운트를 원래 값으로 복구한다", async () => {
    const queryClient = createTestQueryClient();
    const notification = createNotification();
    const cachedData = createCachedData(notification);
    const unreadCount = { activity: 1, meeting: 0, total: 1 };
    queryClient.setQueryData(notificationKeys.infinite("ACTIVITY"), cachedData);
    queryClient.setQueryData(notificationKeys.unreadCount(), unreadCount);
    server.use(
      http.delete("*/api/v1/notifications/99", () =>
        HttpResponse.json(
          {
            success: false,
            data: null,
            error: { code: "INTERNAL_SERVER_ERROR", message: "failed" },
          },
          { status: 500 },
        ),
      ),
    );

    const { result } = renderHook(() => useDeleteNotificationMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await expect(result.current.mutateAsync(notification)).rejects.toThrow();
    await waitFor(() => {
      expect(
        queryClient.getQueryData(notificationKeys.infinite("ACTIVITY")),
      ).toEqual(cachedData);
      expect(queryClient.getQueryData(notificationKeys.unreadCount())).toEqual(
        unreadCount,
      );
    });
  });
});
