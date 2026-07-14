import { HttpResponse, http } from "msw";

import postings from "./data/postings.json";
import volunteers from "./data/volunteers.json";

function getNumberParams(url: URL, key: string) {
  return url.searchParams
    .getAll(key)
    .flatMap((value) => value.split(","))
    .map(Number)
    .filter(Number.isFinite);
}

export const volunteerHandlers = [
  http.get("*/api/v1/postings", ({ request }) => {
    const url = new URL(request.url);

    const page = Number(url.searchParams.get("page") ?? 0);
    const size = Number(url.searchParams.get("size") ?? 20);
    const keyword = url.searchParams.get("keyword")?.trim();
    const regionId = Number(url.searchParams.get("regionId"));
    const status = url.searchParams.get("status");
    const noticeStartDate = url.searchParams.get("noticeStartDate");
    const noticeEndDate = url.searchParams.get("noticeEndDate");

    let items = postings.data;

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

    if (Number.isFinite(regionId)) {
      items = items.filter((posting) => posting.regionId === regionId);
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
      items = items.filter(
        (posting) => posting.noticeEndDate <= noticeEndDate,
      );
    }

    const startIndex = page * size;
    const content = items.slice(startIndex, startIndex + size).map(
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

  http.get("*/api/v1/volunteers", ({ request }) => {
    const url = new URL(request.url);

    const keyword = url.searchParams.get("keyword")?.trim();
    const regionIds = getNumberParams(url, "regionIds");
    const categoryIds = getNumberParams(url, "categoryIds");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    let items = volunteers.data;

    if (keyword) {
      items = items.filter((volunteer) =>
        [
          volunteer.title,
          volunteer.content,
          volunteer.address,
          volunteer.region.name,
          volunteer.category.name,
        ].some((value) => value.includes(keyword)),
      );
    }

    if (regionIds.length > 0) {
      items = items.filter((volunteer) =>
        regionIds.includes(volunteer.region.id),
      );
    }

    if (categoryIds.length > 0) {
      items = items.filter((volunteer) =>
        categoryIds.includes(volunteer.category.id),
      );
    }

    if (startDate) {
      items = items.filter(
        (volunteer) => volunteer.act_start_date >= startDate,
      );
    }

    if (endDate) {
      items = items.filter((volunteer) => volunteer.act_end_date <= endDate);
    }

    return HttpResponse.json({
      success: true,
      data: items,
      error: null,
    });
  }),

  http.get("*/api/v1/volunteers/:volunteerId", ({ params }) => {
    const volunteerId = Number(params.volunteerId);
    const volunteer = volunteers.data.find((item) => item.id === volunteerId);

    if (!volunteer) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "VOLUNTEER_NOT_FOUND",
            message: "봉사 공고를 찾을 수 없습니다.",
          },
        },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: volunteer,
      error: null,
    });
  }),
];
