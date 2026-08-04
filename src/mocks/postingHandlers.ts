import { HttpResponse, http } from "msw";

import { isValidRecognizedMinutes } from "@/features/volunteer/lib/recognizedMinutes";

import postings from "./data/postings.json";
import {
  addMockParticipation,
  removeMockParticipation,
} from "./data/mockParticipations";
import { getMockUserById } from "./data/mockUsers";
import regions from "./data/regions.json";
import teams from "./data/teams.json";
import { createUnauthorizedResponse, getMockUserId } from "./lib/mockAuth";

const POSTING_STATUSES = new Set(["RECRUITING", "CLOSED", "COMPLETED"]);
const RECOMMENDATION_COUNT = 5;
const RECOMMENDATION_DEADLINE_WINDOW_DAYS = 30;
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
type MockPostingParticipationStatus =
  | "APPLIED"
  | "CONFIRMED"
  | "COMPLETED"
  | "REVIEWED";
type MockPostingParticipation = {
  participationId: number;
  status: MockPostingParticipationStatus;
  recognizedMinutes?: number;
};

function formatMockDate(offsetDays: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const baseMockPostings = postings.data.map((posting) => {
  if (posting.id === 1) {
    return {
      ...posting,
      actStartDate: formatMockDate(7),
      actEndDate: formatMockDate(7),
      noticeStartDate: formatMockDate(-14),
      noticeEndDate: formatMockDate(0),
    };
  }

  if (posting.id === 2) {
    return {
      ...posting,
      actStartDate: formatMockDate(2),
      actEndDate: formatMockDate(2),
      noticeStartDate: formatMockDate(-14),
      noticeEndDate: formatMockDate(-1),
    };
  }

  return posting;
});

const recruitmentDeadlineOffsets = [1, 3, 7, 8, 10, 14, 21, 30, 45, 60, 90];

const additionalMockPostings = Array.from({ length: 11 }, (_, index) => {
  const id = index + 3;
  const recruitmentDeadlineOffset = recruitmentDeadlineOffsets[index];

  return {
    ...postings.data[0],
    id,
    title: `봉사공고 무한스크롤 테스트 ${id}`,
    status: "RECRUITING",
    recruitOrg: `테스트 모집기관 ${id}`,
    actStartDate: formatMockDate(recruitmentDeadlineOffset + 2),
    actEndDate: formatMockDate(recruitmentDeadlineOffset + 2),
    noticeStartDate: formatMockDate(-7),
    noticeEndDate: formatMockDate(recruitmentDeadlineOffset),
    recruitCount: 10 + (index % 5),
    applicantCount: (index * 3) % 11,
    category: POSTING_CATEGORIES[index % POSTING_CATEGORIES.length],
    createdAt: `2026-07-${String((index % 20) + 1).padStart(2, "0")}T09:00:00`,
    updatedAt: `2026-07-${String((index % 20) + 1).padStart(2, "0")}T10:00:00`,
  };
});

const mockPostings = [...baseMockPostings, ...additionalMockPostings];
const bookmarkedPostingIds = new Set<number>();
const participatedPostingIds = new Map<number, MockPostingParticipation>([
  [1, { participationId: 1, status: "CONFIRMED" }],
]);

function parseMockLocalDate(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return undefined;
  }

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day)
    ? date
    : undefined;
}

function isMockPostingActivityEnded(postingId: number) {
  const posting = mockPostings.find((item) => item.id === postingId);
  const endDate = parseMockLocalDate(
    posting?.actEndDate ?? posting?.actStartDate,
  );

  if (!endDate) {
    return false;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return endDate.getTime() <= today.getTime();
}

function isMockPostingRecruiting(posting: (typeof postings.data)[number]) {
  const deadline = parseMockLocalDate(posting.noticeEndDate);

  if (posting.status !== "RECRUITING" || !deadline) {
    return false;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return deadline.getTime() >= today.getTime();
}

function getMockPostingRecommendationScore(
  posting: (typeof postings.data)[number],
  preferredCategories: readonly string[],
) {
  const deadline = parseMockLocalDate(posting.noticeEndDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysUntilDeadline = deadline
    ? Math.round((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : RECOMMENDATION_DEADLINE_WINDOW_DAYS;
  const categoryScore = preferredCategories.includes(posting.category) ? 1 : 0;
  const deadlineScore = Math.max(
    0,
    Math.min(
      1,
      (RECOMMENDATION_DEADLINE_WINDOW_DAYS - daysUntilDeadline) /
        RECOMMENDATION_DEADLINE_WINDOW_DAYS,
    ),
  );

  return categoryScore * 0.7 + deadlineScore * 0.3;
}

function toVolunteerPostingListItem(posting: (typeof postings.data)[number]) {
  const {
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
  } = posting;

  return {
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
  };
}

function getRecommendedMockPostings(userId: number | null) {
  const user = userId === null ? null : getMockUserById(userId);
  const preferredCategories = user?.interestCategories ?? [];
  const appliedPostingIds = user?.id === 1 ? participatedPostingIds : null;

  return mockPostings
    .filter(isMockPostingRecruiting)
    .filter((posting) => !appliedPostingIds?.has(posting.id))
    .sort((left, right) => {
      const scoreComparison =
        getMockPostingRecommendationScore(right, preferredCategories) -
        getMockPostingRecommendationScore(left, preferredCategories);

      if (scoreComparison !== 0) {
        return scoreComparison;
      }

      const deadlineComparison = String(left.noticeEndDate).localeCompare(
        String(right.noticeEndDate),
      );

      return deadlineComparison !== 0 ? deadlineComparison : left.id - right.id;
    })
    .slice(0, RECOMMENDATION_COUNT)
    .map(toVolunteerPostingListItem);
}

function getMockPostingParticipationAction(postingId: number) {
  const participation = participatedPostingIds.get(postingId);

  if (!participation) {
    return "APPLY";
  }

  switch (participation.status) {
    case "APPLIED":
    case "CONFIRMED":
      return isMockPostingActivityEnded(postingId) ? "COMPLETE" : "CANCEL";
    case "COMPLETED":
    case "REVIEWED":
      return "NONE";
  }
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

function getPostingStatusPriority(status: string) {
  return status === "RECRUITING" ? 0 : 1;
}

function sortPostings(
  items: (typeof postings.data)[number][],
  sorts: PostingSort[],
  applyStatusPriority: boolean,
) {
  return [...items].sort((left, right) => {
    if (applyStatusPriority) {
      const statusComparison =
        getPostingStatusPriority(left.status) -
        getPostingStatusPriority(right.status);

      if (statusComparison !== 0) {
        return statusComparison;
      }
    }

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

    return right.id - left.id;
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

    if (status) {
      items = items.filter((posting) => posting.status === status);
    } else {
      items = items.filter(
        (posting) =>
          posting.status === "RECRUITING" || posting.status === "CLOSED",
      );
    }

    if (noticeStartDate) {
      items = items.filter(
        (posting) => posting.noticeStartDate >= noticeStartDate,
      );
    }

    if (noticeEndDate) {
      items = items.filter((posting) => posting.noticeEndDate <= noticeEndDate);
    }

    const sortedItems = sortPostings(items, sorts, status === null);
    const startIndex = page * size;
    const content = sortedItems
      .slice(startIndex, startIndex + size)
      .map(toVolunteerPostingListItem);

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

  http.get("*/api/v1/postings/recommended", ({ request }) => {
    return HttpResponse.json({
      success: true,
      data: getRecommendedMockPostings(getMockUserId(request)),
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

  http.get("*/api/v1/postings/:postingId", ({ params }) => {
    const postingId = Number(params.postingId);
    const posting = mockPostings.find((item) => item.id === postingId);

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
          participatedPostingIds.get(postingId)?.status ?? null,
        participationAction: getMockPostingParticipationAction(postingId),
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

      if (participatedPostingIds.has(postingId)) {
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

      const participationId = participatedPostingIds.size + 1;
      participatedPostingIds.set(postingId, {
        participationId,
        status: "APPLIED",
      });
      addMockParticipation(userId, postingId);

      return HttpResponse.json({
        success: true,
        data: {
          participationId,
          status: "APPLIED",
          applicationUrl: `https://1365.go.kr/vols/P9210/partcptn/timeCptn.do?type=show&progrmRegistNo=${postingId}`,
        },
        error: null,
      });
    },
  ),

  http.patch(
    "*/api/v1/postings/:postingId/participations/complete",
    ({ params }) => {
      const postingId = Number(params.postingId);
      const posting = mockPostings.find((item) => item.id === postingId);
      const participation = participatedPostingIds.get(postingId);

      if (!posting) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "POSTING_NOT_FOUND",
              message: "봉사공고를 찾을 수 없습니다.",
            },
          },
          { status: 404 },
        );
      }

      if (!participation) {
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

      if (
        participation.status === "COMPLETED" ||
        participation.status === "REVIEWED"
      ) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "PARTICIPATION_ALREADY_COMPLETED",
              message: "이미 완료 처리된 참여입니다.",
            },
          },
          { status: 409 },
        );
      }

      if (!isMockPostingActivityEnded(postingId)) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "PARTICIPATION_COMPLETE_NOT_ALLOWED",
              message: "활동종료일이 지나야 완료 처리를 할 수 있습니다.",
            },
          },
          { status: 409 },
        );
      }

      participatedPostingIds.set(postingId, {
        ...participation,
        status: "COMPLETED",
      });

      return HttpResponse.json({
        success: true,
        data: null,
        error: null,
      });
    },
  ),

  http.patch(
    "*/api/v1/postings/:postingId/participations/hours",
    async ({ params, request }) => {
      const postingId = Number(params.postingId);
      const participation = participatedPostingIds.get(postingId);
      const body = (await request.json().catch(() => null)) as {
        recognizedMinutes?: unknown;
      } | null;
      const recognizedMinutes = body?.recognizedMinutes;

      if (
        typeof recognizedMinutes !== "number" ||
        !isValidRecognizedMinutes(recognizedMinutes)
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

      if (!participation) {
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

      if (
        participation.status !== "COMPLETED" &&
        participation.status !== "REVIEWED"
      ) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "PARTICIPATION_HOURS_NOT_ALLOWED",
              message: "완료 처리된 참여만 인정시간을 입력할 수 있습니다.",
            },
          },
          { status: 409 },
        );
      }

      if (participation.recognizedMinutes !== undefined) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "PARTICIPATION_HOURS_ALREADY_SUBMITTED",
              message: "이미 인정시간을 입력했습니다.",
            },
          },
          { status: 409 },
        );
      }

      participatedPostingIds.set(postingId, {
        ...participation,
        recognizedMinutes,
      });

      return HttpResponse.json({
        success: true,
        data: null,
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
      const participation = participatedPostingIds.get(postingId);

      if (!participation) {
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

      if (
        participation.status === "COMPLETED" ||
        participation.status === "REVIEWED"
      ) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "PARTICIPATION_CANCEL_NOT_ALLOWED",
              message:
                "이력 보존을 위해 완료되었거나 후기가 작성된 신청은 취소할 수 없습니다.",
            },
          },
          { status: 409 },
        );
      }

      participatedPostingIds.delete(postingId);
      removeMockParticipation(userId, postingId);

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
