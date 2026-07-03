import { HttpResponse, http } from "msw";

import volunteers from "./data/volunteers.json";

function getNumberParams(url: URL, key: string) {
  return url.searchParams
    .getAll(key)
    .flatMap((value) => value.split(","))
    .map(Number)
    .filter(Number.isFinite);
}

export const volunteerHandlers = [
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
          volunteer.description,
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
      items = items.filter((volunteer) => volunteer.date >= startDate);
    }

    if (endDate) {
      items = items.filter((volunteer) => volunteer.date <= endDate);
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
