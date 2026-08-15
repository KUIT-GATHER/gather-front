import { HttpResponse, http } from "msw";

import { isValidRecognizedMinutes } from "@/features/volunteer/lib/recognizedMinutes";
import { isVolunteerPostingActivityPeriodOverlapping } from "@/features/volunteer/lib/volunteerPostingActivityPeriod";
import type {
  PostingListItem,
  VolunteerPostingMapItem,
} from "@/features/volunteer/types/volunteer.types";

import { addMockBadgeProgress } from "./badgeHandlers";
import postings from "./data/postings.json";
import {
  addMockParticipation,
  findMockParticipation,
  getMockParticipations,
  removeMockParticipation,
  updateMockParticipation,
} from "./data/mockParticipations";
import { getMockUserById } from "./data/mockUsers";
import { getExternalMockMeetingRecruitListItems } from "./data/mockMeetingRecruits";
import regions from "./data/regions.json";
import { createUnauthorizedResponse, getMockUserId } from "./lib/mockAuth";
import { getMockMeetings, type MockMeeting } from "./teamHandlers";

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
  "applyDeadlineAt",
  "recruitCount",
  "appliedCount",
  "createdAt",
  "updatedAt",
] as const;

type PostingSortField = (typeof SORTABLE_POSTING_FIELDS)[number];
type PostingSort = {
  field: PostingSortField;
  direction: "asc" | "desc";
};
type SourcePostingSort = {
  field: keyof (typeof postings.data)[number];
  direction: "asc" | "desc";
};
type PostingMeetingSortField = "createdAt";
type PostingMeetingSort = {
  field: PostingMeetingSortField;
  direction: "asc" | "desc";
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
  const externalApplication =
    posting.id % 2 === 0
      ? {
          source: "VMS_CRAWL" as const,
          applicationUrl: `https://www.vms.or.kr/partspace/recruitView.do?seq=${posting.id}`,
        }
      : {
          source: "API_1365" as const,
          applicationUrl: `https://1365.go.kr/vols/P9210/partcptn/timeCptn.do?type=show&progrmRegistNo=${posting.id}`,
        };

  if (posting.id === 1) {
    return {
      ...posting,
      ...externalApplication,
      actStartDate: formatMockDate(1),
      actEndDate: formatMockDate(30),
      noticeStartDate: formatMockDate(-14),
      noticeEndDate: formatMockDate(0),
    };
  }

  if (posting.id === 2) {
    return {
      ...posting,
      ...externalApplication,
      actStartDate: formatMockDate(2),
      actEndDate: formatMockDate(10),
      noticeStartDate: formatMockDate(-14),
      noticeEndDate: formatMockDate(-1),
    };
  }

  return { ...posting, ...externalApplication };
});

const recruitmentDeadlineOffsets = [1, 3, 7, 8, 10, 14, 21, 30, 45, 60, 90];

const additionalMockPostings = Array.from({ length: 25 }, (_, index) => {
  const id = index + 3;
  const recruitmentDeadlineOffset =
    recruitmentDeadlineOffsets[index] ?? 100 + index * 7;

  return {
    ...postings.data[0],
    source: id % 2 === 0 ? ("VMS_CRAWL" as const) : ("API_1365" as const),
    applicationUrl:
      id % 2 === 0
        ? `https://www.vms.or.kr/partspace/recruitView.do?seq=${id}`
        : `https://1365.go.kr/vols/P9210/partcptn/timeCptn.do?type=show&progrmRegistNo=${id}`,
    id,
    title:
      id === 27
        ? "[QA] 한강공원 플로깅 한강공원 플로깅 한강공원 플로깅"
        : `봉사공고 무한스크롤 테스트 ${id}`,
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

export const mockPostings = [...baseMockPostings, ...additionalMockPostings];
const bookmarkedPostingIdsByUserId = new Map<number, Set<number>>([
  [1, new Set(Array.from({ length: 21 }, (_, index) => index + 3))],
]);

function getBookmarkedPostingIds(userId: number) {
  const existingPostingIds = bookmarkedPostingIdsByUserId.get(userId);

  if (existingPostingIds) {
    return existingPostingIds;
  }

  const postingIds = new Set<number>();
  bookmarkedPostingIdsByUserId.set(userId, postingIds);

  return postingIds;
}

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

function isMockPostingActivityEnded(postingId: number, userId: number) {
  const posting = mockPostings.find((item) => item.id === postingId);
  const participation = findMockParticipation(userId, postingId);
  const endDate = parseMockLocalDate(
    participation?.participationEndDate ??
      posting?.actEndDate ??
      posting?.actStartDate,
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

function toUnifiedPostingListItem(
  posting: (typeof postings.data)[number],
): PostingListItem {
  return {
    sourceType: "POSTING" as const,
    id: posting.id,
    meetingId: null,
    title: posting.title,
    organizationName: posting.recruitOrg,
    thumbnailUrl: null,
    regionId: posting.regionId,
    regionName: posting.regionName,
    place: posting.actPlace,
    activityStartAt: posting.actStartDate
      ? `${posting.actStartDate}T${posting.actStartTime ?? "00:00"}:00`
      : null,
    activityEndAt: posting.actEndDate
      ? `${posting.actEndDate}T${posting.actEndTime ?? "23:59"}:00`
      : null,
    applyDeadlineAt: posting.noticeEndDate
      ? `${posting.noticeEndDate}T23:59:59`
      : null,
    maxParticipants: posting.recruitCount,
    appliedCount: posting.applicantCount,
    categories: [posting.category as PostingListItem["categories"][number]],
    status: posting.status,
  };
}

function getUnifiedPostingSortValue(
  item: PostingListItem,
  field: PostingSortField,
) {
  switch (field) {
    case "actStartDate":
      return item.activityStartAt ?? "";
    case "actEndDate":
      return item.activityEndAt ?? "";
    case "noticeStartDate":
    case "applyDeadlineAt":
      return item.applyDeadlineAt ?? "";
    case "recruitCount":
      return item.maxParticipants ?? 0;
    case "appliedCount":
      return item.appliedCount ?? 0;
    case "createdAt":
    case "updatedAt":
      return item.id;
    default:
      return item[field];
  }
}

function sortUnifiedPostings(
  items: PostingListItem[],
  sorts: PostingSort[],
  applyStatusPriority: boolean,
) {
  return [...items].sort((left, right) => {
    if (applyStatusPriority) {
      const statusComparison =
        getPostingStatusPriority(left.status) -
        getPostingStatusPriority(right.status);
      if (statusComparison !== 0) return statusComparison;
    }
    for (const { field, direction } of sorts) {
      const leftValue = getUnifiedPostingSortValue(left, field);
      const rightValue = getUnifiedPostingSortValue(right, field);
      const comparison =
        typeof leftValue === "number" && typeof rightValue === "number"
          ? leftValue - rightValue
          : String(leftValue).localeCompare(String(rightValue));
      if (comparison !== 0)
        return direction === "asc" ? comparison : -comparison;
    }
    return right.id - left.id;
  });
}

function getRecommendedMockPostings(userId: number | null) {
  const user = userId === null ? null : getMockUserById(userId);
  const preferredCategories = user?.interestCategories ?? [];
  const appliedPostingIds =
    userId === null
      ? null
      : new Set(
          getMockParticipations(userId).map(
            (participation) => participation.postingId,
          ),
        );

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

export function getMockPostingParticipationAction(
  postingId: number,
  userId: number | null,
) {
  if (userId === null) {
    return "APPLY";
  }

  const participation = findMockParticipation(userId, postingId);

  if (!participation) {
    return "APPLY";
  }

  if (participation.participationAction) {
    return participation.participationAction;
  }

  switch (participation.status) {
    case "APPLIED":
    case "CONFIRMED":
      return isMockPostingActivityEnded(postingId, userId)
        ? "COMPLETE"
        : "CANCEL";
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

type MockMapBounds = {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
};

function isCoordinateInBounds(
  latitude: number | null,
  longitude: number | null,
  bounds: MockMapBounds,
) {
  return (
    latitude !== null &&
    longitude !== null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= bounds.swLat &&
    latitude <= bounds.neLat &&
    longitude >= bounds.swLng &&
    longitude <= bounds.neLng
  );
}

function toVolunteerPostingMapItem(
  posting: (typeof postings.data)[number],
): VolunteerPostingMapItem {
  return {
    id: posting.id,
    title: posting.title,
    place: posting.actPlace,
    organizationName: posting.recruitOrg,
    regionId: posting.regionId,
    regionName: posting.regionName,
    activityStartAt: posting.actStartDate
      ? `${posting.actStartDate}T${posting.actStartTime ?? "00:00"}:00`
      : null,
    activityEndAt: posting.actEndDate
      ? `${posting.actEndDate}T${posting.actEndTime ?? "23:59"}:00`
      : null,
    applyDeadlineAt: posting.noticeEndDate
      ? `${posting.noticeEndDate}T23:59:59`
      : null,
    category: posting.category as VolunteerPostingMapItem["category"],
    status: posting.status as VolunteerPostingMapItem["status"],
    locations: posting.locations,
  };
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
  sorts: SourcePostingSort[],
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
  items: MockMeeting[],
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
  http.get("*/api/v1/postings/map", ({ request }) => {
    const url = new URL(request.url);
    const regionId = getOptionalNumberParam(url, "regionId");
    const activityStartDate = url.searchParams.get("activityStartDate");
    const activityEndDate = url.searchParams.get("activityEndDate");
    const category = url.searchParams.get("category");
    const swLat = getOptionalNumberParam(url, "swLat");
    const swLng = getOptionalNumberParam(url, "swLng");
    const neLat = getOptionalNumberParam(url, "neLat");
    const neLng = getOptionalNumberParam(url, "neLng");

    if (
      swLat === undefined ||
      swLng === undefined ||
      neLat === undefined ||
      neLng === undefined ||
      swLat > neLat ||
      swLng > neLng ||
      (category &&
        !POSTING_CATEGORIES.includes(
          category as (typeof POSTING_CATEGORIES)[number],
        ))
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

    const bounds = { swLat, swLng, neLat, neLng };
    const includedRegionIds =
      regionId === undefined
        ? undefined
        : getRegionIdsIncludingChildren([regionId]);
    const mapItems = mockPostings
      .filter(
        (posting) =>
          !includedRegionIds || includedRegionIds.has(posting.regionId),
      )
      .filter((posting) => !category || posting.category === category)
      .filter((posting) =>
        isVolunteerPostingActivityPeriodOverlapping(
          posting.actStartDate,
          posting.actEndDate,
          activityStartDate,
          activityEndDate,
        ),
      )
      .filter((posting) =>
        posting.locations.some((location) =>
          isCoordinateInBounds(location.latitude, location.longitude, bounds),
        ),
      )
      .map(toVolunteerPostingMapItem);

    return HttpResponse.json({
      success: true,
      data: mapItems,
      error: null,
    });
  }),

  http.get("*/api/v1/postings", ({ request }) => {
    const url = new URL(request.url);

    const page = Number(url.searchParams.get("page") ?? 0);
    const size = Number(url.searchParams.get("size") ?? 20);
    const keyword = url.searchParams.get("keyword")?.trim();
    const regionId = getOptionalNumberParam(url, "regionId");
    const status = url.searchParams.get("status");
    const activityStartDate = url.searchParams.get("activityStartDate");
    const activityEndDate = url.searchParams.get("activityEndDate");
    const category = url.searchParams.get("category");
    const sorts = parseSorts(url);

    let items = mockPostings;

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

    if (status) {
      items = items.filter((posting) => posting.status === status);
    } else {
      items = items.filter(
        (posting) =>
          posting.status === "RECRUITING" || posting.status === "CLOSED",
      );
    }

    items = items.filter((posting) =>
      isVolunteerPostingActivityPeriodOverlapping(
        posting.actStartDate,
        posting.actEndDate,
        activityStartDate,
        activityEndDate,
      ),
    );

    const meetingRecruitItems = getExternalMockMeetingRecruitListItems().filter(
      (meetingRecruitItem) =>
        (!keyword ||
          [meetingRecruitItem.title, meetingRecruitItem.organizationName].some(
            (value) => value?.includes(keyword),
          )) &&
        (!category ||
          meetingRecruitItem.categories.includes(
            category as PostingListItem["categories"][number],
          )) &&
        (regionId === undefined ||
          getRegionIdsIncludingChildren([regionId]).has(
            meetingRecruitItem.regionId!,
          )) &&
        (status
          ? meetingRecruitItem.status === status
          : meetingRecruitItem.status === "RECRUITING" ||
            meetingRecruitItem.status === "CLOSED") &&
        isVolunteerPostingActivityPeriodOverlapping(
          meetingRecruitItem.activityStartAt?.slice(0, 10),
          meetingRecruitItem.activityEndAt?.slice(0, 10),
          activityStartDate,
          activityEndDate,
        ),
    );
    const unifiedItems = sortUnifiedPostings(
      [...items.map(toUnifiedPostingListItem), ...meetingRecruitItems],
      sorts,
      status === null,
    );
    const startIndex = page * size;
    const content = unifiedItems.slice(startIndex, startIndex + size);

    return HttpResponse.json({
      success: true,
      data: {
        content,
        totalElements: unifiedItems.length,
        totalPages: Math.ceil(unifiedItems.length / size),
        page,
        size,
      },
      error: null,
    });
  }),

  http.get("*/api/v1/postings/bookmarks", ({ request }) => {
    const userId = getMockUserId(request);

    if (!userId) {
      return createUnauthorizedResponse();
    }

    const url = new URL(request.url);

    const page = Math.max(0, Number(url.searchParams.get("page")) || 0);
    const size = Math.max(1, Number(url.searchParams.get("size")) || 20);
    const keyword = url.searchParams.get("keyword")?.trim();
    const regionId = getOptionalNumberParam(url, "regionId");
    const activityStartDate = url.searchParams.get("activityStartDate");
    const activityEndDate = url.searchParams.get("activityEndDate");
    const category = url.searchParams.get("category");

    const bookmarkedPostingIds = getBookmarkedPostingIds(userId);
    let items = mockPostings.filter((posting) =>
      bookmarkedPostingIds.has(posting.id),
    );

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

    items = items.filter((posting) =>
      isVolunteerPostingActivityPeriodOverlapping(
        posting.actStartDate,
        posting.actEndDate,
        activityStartDate,
        activityEndDate,
      ),
    );

    const sortedItems = sortPostings(items, [], false);
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
      getMockMeetings().filter((team) => team.volunteerPostingId === postingId),
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
          regionId,
          regionName,
          status,
        }) => ({
          meetingId,
          name,
          categories,
          currentMemberCount,
          maxMember,
          regionId,
          regionName,
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
    const participation =
      userId === null ? null : findMockParticipation(userId, postingId);

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
        bookmarked:
          userId === null
            ? false
            : getBookmarkedPostingIds(userId).has(postingId),
        participationStatus: participation?.status ?? null,
        participationStartDate: participation?.participationStartDate ?? null,
        participationEndDate: participation?.participationEndDate ?? null,
        participationAction: getMockPostingParticipationAction(
          postingId,
          userId,
        ),
      },
      error: null,
    });
  }),

  http.post("*/api/v1/postings/:postingId/bookmark", ({ params, request }) => {
    const userId = getMockUserId(request);
    if (!userId) return createUnauthorizedResponse();

    const postingId = Number(params.postingId);
    getBookmarkedPostingIds(userId).add(postingId);
    addMockBadgeProgress(userId, "BOOKMARK_5");

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
    async ({ params, request }) => {
      const userId = getMockUserId(request);
      if (!userId) return createUnauthorizedResponse();

      const postingId = Number(params.postingId);
      const posting = mockPostings.find((item) => item.id === postingId);
      const body = (await request.json().catch(() => null)) as {
        participationStartDate?: unknown;
        participationEndDate?: unknown;
      } | null;

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

      const participationStartDate =
        typeof body?.participationStartDate === "string"
          ? body.participationStartDate
          : undefined;
      const participationEndDate =
        typeof body?.participationEndDate === "string"
          ? body.participationEndDate
          : undefined;
      const startDate = parseMockLocalDate(participationStartDate);
      const endDate = parseMockLocalDate(participationEndDate);
      const postingStartDate = parseMockLocalDate(posting.actStartDate);
      const postingEndDate = parseMockLocalDate(posting.actEndDate);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (
        !participationStartDate ||
        !participationEndDate ||
        !startDate ||
        !endDate ||
        !postingStartDate ||
        !postingEndDate ||
        startDate > endDate ||
        startDate < today ||
        startDate < postingStartDate ||
        endDate > postingEndDate
      ) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "VALIDATION_ERROR",
              message: "선택한 봉사 일정이 신청 가능 기간에 포함되지 않습니다.",
            },
          },
          { status: 400 },
        );
      }

      const { participationId } = addMockParticipation(
        userId,
        postingId,
        participationStartDate,
        participationEndDate,
      );

      return HttpResponse.json({
        success: true,
        data: {
          participationId,
          status: "APPLIED",
          participationStartDate,
          participationEndDate,
        },
        error: null,
      });
    },
  ),

  http.patch(
    "*/api/v1/postings/:postingId/participations/complete",
    ({ params, request }) => {
      const userId = getMockUserId(request);
      if (!userId) return createUnauthorizedResponse();

      const postingId = Number(params.postingId);
      const posting = mockPostings.find((item) => item.id === postingId);
      const participation = findMockParticipation(userId, postingId);

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

      if (!isMockPostingActivityEnded(postingId, userId)) {
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

      updateMockParticipation(userId, postingId, { status: "COMPLETED" });
      addMockBadgeProgress(userId, "FIRST_COMPLETION");
      addMockBadgeProgress(userId, "COMPLETION_5");

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
      const userId = getMockUserId(request);
      if (!userId) return createUnauthorizedResponse();

      const postingId = Number(params.postingId);
      const participation = findMockParticipation(userId, postingId);
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

      updateMockParticipation(userId, postingId, { recognizedMinutes });

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
      const participation = findMockParticipation(userId, postingId);

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

      removeMockParticipation(userId, postingId);

      return HttpResponse.json({
        success: true,
        data: null,
        error: null,
      });
    },
  ),

  http.delete(
    "*/api/v1/postings/:postingId/bookmark",
    ({ params, request }) => {
      const userId = getMockUserId(request);
      if (!userId) return createUnauthorizedResponse();

      const postingId = Number(params.postingId);
      getBookmarkedPostingIds(userId).delete(postingId);
      addMockBadgeProgress(userId, "BOOKMARK_5", -1);

      return HttpResponse.json({
        success: true,
        data: {
          postingId,
          bookmarked: false,
        },
        error: null,
      });
    },
  ),
];
