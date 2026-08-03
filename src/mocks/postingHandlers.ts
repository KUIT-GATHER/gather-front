import { HttpResponse, http } from "msw";

import postings from "./data/postings.json";
import { mockPostings } from "./data/mockPostings";
import {
  addMockParticipation,
  findMockParticipation,
  removeMockParticipation,
} from "./data/mockParticipations";
import regions from "./data/regions.json";
import teams from "./data/teams.json";
import { createUnauthorizedResponse, getMockUserId } from "./lib/mockAuth";

const POSTING_STATUSES = new Set(["RECRUITING", "CLOSED", "COMPLETED"]);
const POSTING_CATEGORIES = [
  "ENVIRONMENT",
  "EDUCATION",
  "CULTURE",
  "COMMUNITY",
  "WELFARE",
  "OVERSEAS",
] as const;
const SORTABLE_POSTING_FIELDS = [
  "id",
  "title",
  "status",
  "actStartDate",
  "actEndDate",
  "noticeStartDate",
  "noticeEndDate",
  "recruitCount",
  "applicantCount",
  "createdAt",
  "updatedAt",
] as const;

type PostingSortField = (typeof SORTABLE_POSTING_FIELDS)[number];
type PostingSort = {
  field: PostingSortField;
  direction: "asc" | "desc";
};
type PostingMeetingSortField = "createdAt";
type PostingMeetingSort = {
  field: PostingMeetingSortField;
  direction: "asc" | "desc";
};

const bookmarkedPostingIds = new Set<number>();

function getMockPostingParticipationAction(
  userId: number | null,
  postingId: number,
) {
  return userId && findMockParticipation(userId, postingId)
    ? "CANCEL"
    : "APPLY";
}

function getOptionalNumberParam(url: URL, key: string) {
  const rawValue = url.searchParams.get(key);

  if (rawValue === null || rawValue.trim() === "") {
    return undefined;
  }

  const parsedValue = Number(rawValue);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function getRegionIdsIncludingChildren(regionIds: Iterable<number>) {
  const includedRegionIds = new Set(regionIds);
  const pendingParentIds = [...includedRegionIds];

  while (pendingParentIds.length > 0) {
    const parentId = pendingParentIds.pop();

    for (const region of regions.data) {
      if (region.parentId === parentId && !includedRegionIds.has(region.id)) {
        includedRegionIds.add(region.id);
        pendingParentIds.push(region.id);
      }
    }
  }

  return includedRegionIds;
}

function getRegionIdsByGroup(regionGroupId: number) {
  const level1RegionIds = regions.data
    .filter(
      (region) => region.level === 1 && region.regionGroupId === regionGroupId,
    )
    .map((region) => region.id);

  return getRegionIdsIncludingChildren(level1RegionIds);
}

function parseSorts(url: URL): PostingSort[] | null {
  const rawSorts = url.searchParams.getAll("sort");

  return rawSorts.reduce<PostingSort[] | null>((sorts, rawSort) => {
    if (!sorts) {
      return null;
    }

    const [field, direction = "asc"] = rawSort.split(",");

    if (
      !SORTABLE_POSTING_FIELDS.includes(field as PostingSortField) ||
      (direction !== "asc" && direction !== "desc")
    ) {
      return null;
    }

    sorts.push({ field: field as PostingSortField, direction });
    return sorts;
  }, []);
}

function parsePostingMeetingSorts(url: URL): PostingMeetingSort[] | null {
  const rawSorts = url.searchParams.getAll("sort");

  if (rawSorts.length === 0) {
    return [{ field: "createdAt", direction: "desc" }];
  }

  return rawSorts.reduce<PostingMeetingSort[] | null>((sorts, rawSort) => {
    if (!sorts) {
      return null;
    }

    const [field, direction = "asc"] = rawSort.split(",");

    if (
      field !== "createdAt" ||
      (direction !== "asc" && direction !== "desc")
    ) {
      return null;
    }

    sorts.push({ field, direction });
    return sorts;
  }, []);
}

function sortPostings(
  items: (typeof postings.data)[number][],
  sorts: PostingSort[],
) {
  if (sorts.length === 0) {
    return items;
  }

  return [...items].sort((left, right) => {
    for (const { field, direction } of sorts) {
      const leftValue = left[field];
      const rightValue = right[field];
      const comparison =
        typeof leftValue === "number" && typeof rightValue === "number"
          ? leftValue - rightValue
          : String(leftValue).localeCompare(String(rightValue));

      if (comparison !== 0) {
        return direction === "asc" ? comparison : -comparison;
      }
    }

    return 0;
  });
}

function sortPostingMeetings(
  items: (typeof teams.data)[number][],
  sorts: PostingMeetingSort[],
) {
  return [...items].sort((left, right) => {
    for (const { direction } of sorts) {
      const comparison = left.meetingId - right.meetingId;

      if (comparison !== 0) {
        return direction === "asc" ? comparison : -comparison;
      }
    }

    return 0;
  });
}

export const postingHandlers = [
  http.get("*/api/v1/postings/bookmarks", ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 0);
    const size = Number(url.searchParams.get("size") ?? 20);
    const category = url.searchParams.get("category");
    const regionId = getOptionalNumberParam(url, "regionId");
    const noticeStartDate = url.searchParams.get("noticeStartDate");
    const noticeEndDate = url.searchParams.get("noticeEndDate");
    let items = mockPostings.filter((posting) =>
      bookmarkedPostingIds.has(posting.id),
    );

    if (category) {
      items = items.filter((posting) => posting.category === category);
    }
    if (regionId !== undefined) {
      const regionIds = getRegionIdsIncludingChildren([regionId]);
      items = items.filter((posting) => regionIds.has(posting.regionId));
    }
    if (noticeStartDate) {
      items = items.filter(
        (posting) => posting.noticeStartDate >= noticeStartDate,
      );
    }
    if (noticeEndDate) {
      items = items.filter((posting) => posting.noticeEndDate <= noticeEndDate);
    }

    return HttpResponse.json({
      success: true,
      data: {
        content: items.slice(page * size, (page + 1) * size),
        totalElements: items.length,
        totalPages: Math.ceil(items.length / size),
        page,
        size,
      },
      error: null,
    });
  }),

  http.get("*/api/v1/postings", ({ request }) => {
    const url = new URL(request.url);

    const page = Number(url.searchParams.get("page") ?? 0);
    const size = Number(url.searchParams.get("size") ?? 20);
    const keyword = url.searchParams.get("keyword")?.trim();
    const regionId = getOptionalNumberParam(url, "regionId");
    const regionGroupId = getOptionalNumberParam(url, "regionGroupId");
    const status = url.searchParams.get("status");
    const noticeStartDate = url.searchParams.get("noticeStartDate");
    const noticeEndDate = url.searchParams.get("noticeEndDate");
    const category = url.searchParams.get("category");
    const sorts = parseSorts(url);

    let items = mockPostings;

    if (regionId !== undefined && regionGroupId !== undefined) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "regionId와 regionGroupId는 동시에 사용할 수 없습니다.",
          },
        },
        { status: 400 },
      );
    }

    if (!sorts) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "요청 값이 올바르지 않습니다.",
          },
        },
        { status: 400 },
      );
    }

    if (status && !POSTING_STATUSES.has(status)) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "요청 값이 올바르지 않습니다.",
          },
        },
        { status: 400 },
      );
    }

    if (
      category &&
      !POSTING_CATEGORIES.includes(
        category as (typeof POSTING_CATEGORIES)[number],
      )
    ) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "요청 값이 올바르지 않습니다.",
          },
        },
        { status: 400 },
      );
    }

    if (keyword) {
      items = items.filter((posting) =>
        [posting.title, posting.recruitOrg].some((value) =>
          value.includes(keyword),
        ),
      );
    }

    if (category) {
      items = items.filter((posting) => posting.category === category);
    }

    if (regionId !== undefined) {
      const includedRegionIds = getRegionIdsIncludingChildren([regionId]);

      items = items.filter((posting) =>
        includedRegionIds.has(posting.regionId),
      );
    }

    if (regionGroupId !== undefined) {
      const includedRegionIds = getRegionIdsByGroup(regionGroupId);

      items = items.filter((posting) =>
        includedRegionIds.has(posting.regionId),
      );
    }

    items = items.filter(
      (posting) => posting.status === (status ?? "RECRUITING"),
    );

    if (noticeStartDate) {
      items = items.filter(
        (posting) => posting.noticeStartDate >= noticeStartDate,
      );
    }

    if (noticeEndDate) {
      items = items.filter((posting) => posting.noticeEndDate <= noticeEndDate);
    }

    const sortedItems = sortPostings(items, sorts);
    const startIndex = page * size;
    const content = sortedItems
      .slice(startIndex, startIndex + size)
      .map(
        ({
          id,
          title,
          status,
          recruitOrg,
          actStartDate,
          actEndDate,
          actPlace,
          recruitCount,
          applicantCount,
          regionId,
          regionName,
          category,
          noticeEndDate,
        }) => ({
          id,
          title,
          status,
          recruitOrg,
          actStartDate,
          actEndDate,
          actPlace,
          recruitCount,
          applicantCount,
          regionId,
          regionName,
          category,
          noticeEndDate,
        }),
      );

    return HttpResponse.json({
      success: true,
      data: {
        content,
        totalElements: sortedItems.length,
        totalPages: Math.ceil(sortedItems.length / size),
        page,
        size,
      },
      error: null,
    });
  }),

  http.get("*/api/v1/postings/keywords/recommended", () => {
    return HttpResponse.json({
      success: true,
      data: ["유기견", "환경", "아동", "멘토링"],
      error: null,
    });
  }),

  http.get("*/api/v1/postings/:postingId/meetings", ({ params, request }) => {
    const postingId = Number(params.postingId);
    const posting = mockPostings.find((item) => item.id === postingId);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 0);
    const size = Number(url.searchParams.get("size") ?? 10);
    const sorts = parsePostingMeetingSorts(url);

    if (!posting) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "POSTING_NOT_FOUND",
            message: "Posting not found.",
          },
        },
        { status: 404 },
      );
    }

    if (!sorts) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid sort parameter.",
          },
        },
        { status: 400 },
      );
    }

    const items = sortPostingMeetings(
      teams.data.filter((team) => team.volunteerPostingId === postingId),
      sorts,
    );
    const startIndex = page * size;
    const content = items
      .slice(startIndex, startIndex + size)
      .map(
        ({
          meetingId,
          name,
          categories,
          currentMemberCount,
          maxMember,
          status,
        }) => ({
          meetingId,
          name,
          category: categories[0],
          currentMemberCount,
          maxMember,
          status,
          member: false,
          host: false,
        }),
      );

    return HttpResponse.json({
      success: true,
      data: {
        content,
        totalElements: items.length,
        totalPages: Math.ceil(items.length / size),
        page,
        size,
      },
      error: null,
    });
  }),

  http.get("*/api/v1/postings/:postingId", ({ params, request }) => {
    const postingId = Number(params.postingId);
    const posting = mockPostings.find((item) => item.id === postingId);
    const userId = getMockUserId(request);

    if (!posting) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "POSTING_NOT_FOUND",
            message: "봉사 공고를 찾을 수 없습니다.",
          },
        },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        ...posting,
        bookmarked: bookmarkedPostingIds.has(postingId),
        participationStatus:
          userId && findMockParticipation(userId, postingId) ? "APPLIED" : null,
        participationAction: getMockPostingParticipationAction(
          userId,
          postingId,
        ),
      },
      error: null,
    });
  }),

  http.post("*/api/v1/postings/:postingId/bookmark", ({ params }) => {
    const postingId = Number(params.postingId);
    bookmarkedPostingIds.add(postingId);

    return HttpResponse.json({
      success: true,
      data: {
        postingId,
        bookmarked: true,
      },
      error: null,
    });
  }),

  http.post(
    "*/api/v1/postings/:postingId/participations",
    ({ params, request }) => {
      const userId = getMockUserId(request);
      if (!userId) return createUnauthorizedResponse();

      const postingId = Number(params.postingId);
      const posting = mockPostings.find((item) => item.id === postingId);

      if (!posting) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "POSTING_NOT_FOUND",
              message: "Posting not found.",
            },
          },
          { status: 404 },
        );
      }

      if (findMockParticipation(userId, postingId)) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "PARTICIPATION_DUPLICATE",
              message: "Already applied to this posting.",
            },
          },
          { status: 409 },
        );
      }

      if (posting.status !== "RECRUITING") {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "POSTING_CLOSED",
              message: "마감된 봉사공고입니다.",
            },
          },
          { status: 409 },
        );
      }

      const participation = addMockParticipation(userId, postingId);

      return HttpResponse.json({
        success: true,
        data: {
          participationId: participation.participationId,
          status: participation.status,
          applicationUrl: `https://1365.go.kr/vols/P9210/partcptn/timeCptn.do?type=show&progrmRegistNo=${postingId}`,
        },
        error: null,
      });
    },
  ),

  http.delete(
    "*/api/v1/postings/:postingId/participations",
    ({ params, request }) => {
      const userId = getMockUserId(request);
      if (!userId) return createUnauthorizedResponse();

      const postingId = Number(params.postingId);

      if (!removeMockParticipation(userId, postingId)) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "PARTICIPATION_NOT_FOUND",
              message: "신청 내역을 찾을 수 없습니다.",
            },
          },
          { status: 404 },
        );
      }

      return HttpResponse.json({
        success: true,
        data: null,
        error: null,
      });
    },
  ),

  http.delete("*/api/v1/postings/:postingId/bookmark", ({ params }) => {
    const postingId = Number(params.postingId);
    bookmarkedPostingIds.delete(postingId);

    return HttpResponse.json({
      success: true,
      data: {
        postingId,
        bookmarked: false,
      },
      error: null,
    });
  }),
];
