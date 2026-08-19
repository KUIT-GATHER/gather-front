import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { type ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { useInfiniteBookmarkedVolunteerPostingsQuery } from "@/features/volunteer/hooks/useInfiniteBookmarkedVolunteerPostingsQuery";
import { useInfiniteVolunteerPostingsQuery } from "@/features/volunteer/hooks/useInfiniteVolunteerPostingsQuery";
import type {
  PostingListCursorPage,
  PostingListItem,
  VolunteerPostingPage,
} from "@/features/volunteer/types/volunteer.types";
import type { ApiSuccessResponse } from "@/shared/api/apiResponse";
import { server } from "@/mocks/server";
import { createTestQueryClient } from "@/test/createTestQueryClient";

function createPostingListItem(id: number): PostingListItem {
  return {
    sourceType: "POSTING",
    meetingId: null,
    id,
    title: `봉사 공고 ${id}`,
    organizationName: "Gather",
    thumbnailUrl: null,
    regionId: 1,
    regionName: "서울",
    place: "서울",
    activityStartAt: null,
    activityEndAt: null,
    applyDeadlineAt: null,
    maxParticipants: 10,
    appliedCount: 0,
    categories: ["ENVIRONMENT"],
    status: "RECRUITING",
  };
}

function createCursorResponse(
  content: PostingListItem[],
  nextCursor: string | null,
  hasNext: boolean,
): ApiSuccessResponse<PostingListCursorPage> {
  return {
    success: true,
    data: { content, nextCursor, hasNext },
    error: null,
  };
}

function createOffsetResponse(
  page: number,
  totalPages: number,
): ApiSuccessResponse<VolunteerPostingPage> {
  return {
    success: true,
    data: {
      content: [],
      totalElements: totalPages,
      totalPages,
      page,
      size: 1,
    },
    error: null,
  };
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("volunteer posting infinite queries", () => {
  it("첫 요청은 page/cursor 없이 시작하고 다음 요청에 opaque cursor를 그대로 전달한다", async () => {
    const requests: URL[] = [];

    server.use(
      http.get("*/api/v1/postings", ({ request }) => {
        const url = new URL(request.url);
        requests.push(url);

        return HttpResponse.json(
          url.searchParams.has("cursor")
            ? createCursorResponse([createPostingListItem(2)], null, false)
            : createCursorResponse(
                [createPostingListItem(1)],
                "cursor-A",
                true,
              ),
        );
      }),
    );

    const { result } = renderHook(
      () =>
        useInfiniteVolunteerPostingsQuery({
          size: 10,
          sort: ["createdAt,desc", "id,desc"],
          keyword: "환경",
          regionId: 1,
        }),
      { wrapper: createWrapper(createTestQueryClient()) },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(requests[0].searchParams.has("page")).toBe(false);
    expect(requests[0].searchParams.has("cursor")).toBe(false);
    expect(requests[0].searchParams.get("size")).toBe("10");
    expect(requests[0].searchParams.getAll("sort")).toEqual([
      "createdAt,desc",
      "id,desc",
    ]);
    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));

    expect(requests[1].searchParams.get("cursor")).toBe("cursor-A");
    expect(requests[1].searchParams.has("page")).toBe(false);
    expect(result.current.data?.pages.flatMap((page) => page.content)).toEqual([
      createPostingListItem(1),
      createPostingListItem(2),
    ]);
    expect(result.current.hasNextPage).toBe(false);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(requests).toHaveLength(2);
  });

  it("sort/filter가 바뀌면 기존 cursor를 재사용하지 않고 새 query로 시작한다", async () => {
    const requests: URL[] = [];

    server.use(
      http.get("*/api/v1/postings", ({ request }) => {
        const url = new URL(request.url);
        requests.push(url);

        const isPopular = url.searchParams.get("sort") === "appliedCount,desc";
        const cursor = url.searchParams.get("cursor");

        if (!isPopular && cursor === null) {
          return HttpResponse.json(
            createCursorResponse([createPostingListItem(1)], "cursor-A", true),
          );
        }

        if (!isPopular && cursor === "cursor-A") {
          return HttpResponse.json(
            createCursorResponse([createPostingListItem(2)], null, false),
          );
        }

        return HttpResponse.json(
          createCursorResponse([createPostingListItem(3)], null, false),
        );
      }),
    );

    const queryClient = createTestQueryClient();
    const { result, rerender } = renderHook(
      ({ params }) => useInfiniteVolunteerPostingsQuery(params),
      {
        initialProps: {
          params: {
            size: 10,
            sort: ["createdAt,desc", "id,desc"],
            keyword: "환경",
          },
        },
        wrapper: createWrapper(queryClient),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);
    await act(async () => {
      await result.current.fetchNextPage();
    });
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));

    rerender({
      params: {
        size: 10,
        sort: ["appliedCount,desc", "id,desc"],
        keyword: "교육",
      },
    });

    await waitFor(() =>
      expect(result.current.data?.pages[0]?.content[0]?.id).toBe(3),
    );

    const changedRequest = requests[requests.length - 1];
    expect(changedRequest.searchParams.has("cursor")).toBe(false);
    expect(changedRequest.searchParams.getAll("sort")).toEqual([
      "appliedCount,desc",
      "id,desc",
    ]);
    expect(changedRequest.searchParams.get("keyword")).toBe("교육");
  });

  it("bookmark infinite query는 page 기반 OFFSET pagination을 유지한다", async () => {
    const requests: URL[] = [];

    server.use(
      http.get("*/api/v1/postings/bookmarks", ({ request }) => {
        const url = new URL(request.url);
        requests.push(url);

        return HttpResponse.json(
          createOffsetResponse(Number(url.searchParams.get("page")), 2),
        );
      }),
    );

    const { result } = renderHook(
      () => useInfiniteBookmarkedVolunteerPostingsQuery({ size: 1 }),
      { wrapper: createWrapper(createTestQueryClient()) },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);
    await act(async () => {
      await result.current.fetchNextPage();
    });
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));

    expect(requests.map((url) => url.searchParams.get("page"))).toEqual([
      "0",
      "1",
    ]);
    expect(requests.every((url) => !url.searchParams.has("cursor"))).toBe(true);
  });
});
