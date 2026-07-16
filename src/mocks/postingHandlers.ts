import { HttpResponse, http } from "msw";

import postings from "./data/postings.json";
import regions from "./data/regions.json";

const POSTING_STATUSES = new Set(["RECRUITING", "CLOSED", "COMPLETED"]);
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
    const sorts = parseSorts(url);

    let items = postings.data;

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

    if (keyword) {
      items = items.filter((posting) =>
        [posting.title, posting.recruitOrg].some((value) =>
          value.includes(keyword),
        ),
      );
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

  http.get("*/api/v1/postings/:postingId", ({ params }) => {
    const postingId = Number(params.postingId);
    const posting = postings.data.find((item) => item.id === postingId);

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
      data: posting,
      error: null,
    });
  }),

  http.post("*/api/v1/postings/:postingId/bookmark", ({ params }) => {
    const postingId = Number(params.postingId);

    return HttpResponse.json({
      success: true,
      data: {
        postingId,
        bookmarked: true,
      },
      error: null,
    });
  }),

  http.delete("*/api/v1/postings/:postingId/bookmark", ({ params }) => {
    const postingId = Number(params.postingId);

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
