import { HttpResponse, http } from "msw";

import postings from "./data/postings.json";
import regions from "./data/regions.json";

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

    if (keyword) {
      items = items.filter((posting) =>
        [
          posting.title,
          posting.content,
          posting.actPlace,
          posting.regionName,
          posting.categoryName,
        ].some((value) => value.includes(keyword)),
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

    if (status) {
      items = items.filter((posting) => posting.status === status);
    }

    if (noticeStartDate) {
      items = items.filter(
        (posting) => posting.noticeStartDate >= noticeStartDate,
      );
    }

    if (noticeEndDate) {
      items = items.filter((posting) => posting.noticeEndDate <= noticeEndDate);
    }

    const startIndex = page * size;
    const content = items
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
          categoryId,
          categoryName,
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
          categoryId,
          categoryName,
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
