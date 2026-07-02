import { HttpResponse, http } from "msw";

import volunteers from "./data/volunteers.json";

export const volunteerHandlers = [
  http.get("*/api/v1/volunteers", ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get("keyword");
    const regionIds = url.searchParams.getAll("regionIds");
    const categoryIds = url.searchParams.getAll("categoryIds");

    let items = volunteers.data;

    if (keyword) {
      items = items.filter((volunteer) => volunteer.title.includes(keyword));
    }

    if (regionIds.length > 0) {
      items = items.filter((volunteer) =>
        regionIds.includes(String(volunteer.region.id)),
      );
    }

    if (categoryIds.length > 0) {
      items = items.filter((volunteer) =>
        categoryIds.includes(String(volunteer.category.id)),
      );
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
