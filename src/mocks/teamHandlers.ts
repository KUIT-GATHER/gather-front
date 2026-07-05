import { HttpResponse, http } from "msw";

import teams from "./data/teams.json";

function getNumberParams(url: URL, key: string) {
  return url.searchParams
    .getAll(key)
    .flatMap((value) => value.split(","))
    .map(Number)
    .filter(Number.isFinite);
}

export const teamHandlers = [
  http.get("*/api/v1/teams", ({ request }) => {
    const url = new URL(request.url);

    const keyword = url.searchParams.get("keyword")?.trim();
    const regionIds = getNumberParams(url, "regionIds");
    const categoryIds = getNumberParams(url, "categoryIds");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    let items = teams.data;

    if (keyword) {
      items = items.filter((team) =>
        [
          team.title,
          team.content,
          team.address,
          team.sido_name,
          team.sigungu_name,
          team.region.name,
          team.category.name,
        ].some((value) => value?.includes(keyword)),
      );
    }

    if (regionIds.length > 0) {
      items = items.filter((team) => regionIds.includes(team.region.id));
    }

    if (categoryIds.length > 0) {
      items = items.filter((team) => categoryIds.includes(team.category.id));
    }

    if (startDate) {
      items = items.filter((team) => team.meeting_date >= startDate);
    }

    if (endDate) {
      items = items.filter((team) => team.meeting_date <= endDate);
    }

    return HttpResponse.json({
      success: true,
      data: items,
      error: null,
    });
  }),

  http.get("*/api/v1/teams/:teamId", ({ params }) => {
    const teamId = Number(params.teamId);
    const team = teams.data.find((item) => item.id === teamId);

    if (!team) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "TEAM_NOT_FOUND",
            message: "모임을 찾을 수 없습니다.",
          },
        },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: team,
      error: null,
    });
  }),

  http.get("*/api/v1/volunteers/:volunteerId/teams", ({ params }) => {
    const volunteerId = Number(params.volunteerId);
    const items = teams.data.filter(
      (team) => team.volunteer_id === volunteerId,
    );

    return HttpResponse.json({
      success: true,
      data: items,
      error: null,
    });
  }),
];
