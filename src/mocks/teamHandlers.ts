import { HttpResponse, http } from "msw";

import teams from "./data/teams.json";

const MEETING_STATUSES = new Set(["RECRUITING", "CLOSED", "COMPLETED"]);
const POSTING_CATEGORIES = new Set([
  "ENVIRONMENT",
  "EDUCATION",
  "CULTURE",
  "COMMUNITY",
  "WELFARE",
  "OVERSEAS",
]);

function getOptionalNumberParam(url: URL, key: string) {
  const rawValue = url.searchParams.get(key);

  if (!rawValue || rawValue.trim() === "") {
    return undefined;
  }

  const value = Number(rawValue);

  return Number.isFinite(value) ? value : undefined;
}

function toMeetingListItem(team: (typeof teams.data)[number]) {
  return {
    meetingId: team.meetingId,
    name: team.name,
    description: team.description,
    currentMemberCount: team.currentMemberCount,
    maxMember: team.maxMember,
    regionId: team.regionId,
    category: team.category,
    status: team.status,
    deadline: team.deadline,
    activityStartAt: team.activityStartAt,
  };
}

export const teamHandlers = [
  http.get("*/api/v1/meetings", ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get("keyword")?.trim();
    const regionId = getOptionalNumberParam(url, "regionId");
    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status");

    if (category && !POSTING_CATEGORIES.has(category)) {
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

    if (status && !MEETING_STATUSES.has(status)) {
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

    let items = teams.data;

    if (keyword) {
      items = items.filter((team) =>
        [team.name, team.description]
          .filter((value): value is string => value !== null)
          .some((value) => value.includes(keyword)),
      );
    }

    if (regionId !== undefined) {
      items = items.filter((team) => team.regionId === regionId);
    }

    if (category) {
      items = items.filter((team) => team.category === category);
    }

    if (status) {
      items = items.filter((team) => team.status === status);
    }

    return HttpResponse.json({
      success: true,
      data: items.map(toMeetingListItem),
      error: null,
    });
  }),

  http.get("*/api/v1/meetings/:meetingId/home", ({ params }) => {
    const meetingId = Number(params.meetingId);
    const team = teams.data.find((item) => item.meetingId === meetingId);

    if (!team) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "MEETING_NOT_FOUND",
            message: "모임을 찾을 수 없습니다.",
          },
        },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        meetingId: team.meetingId,
        name: team.name,
        description: team.description,
        deadline: team.deadline,
        regionName: team.regionName,
        currentMemberCount: team.currentMemberCount,
        maxMember: team.maxMember,
        timeVerified: false,
        status: team.status,
        basedOnPosting: team.volunteerPostingId !== null,
        linkedPostingId: team.volunteerPostingId,
        linkedPostingTitle: null,
        participationCondition: team.participationCondition,
        members: [],
        upcomingActivity: null,
        member: false,
        host: false,
      },
      error: null,
    });
  }),

  http.get("*/api/v1/meetings/:meetingId", ({ params }) => {
    const meetingId = Number(params.meetingId);
    const team = teams.data.find((item) => item.meetingId === meetingId);

    if (!team) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "MEETING_NOT_FOUND",
            message: "모임을 찾을 수 없습니다.",
          },
        },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        ...toMeetingListItem(team),
        hostId: team.hostId,
        volunteerPostingId: team.volunteerPostingId,
        participationCondition: team.participationCondition,
        memo: team.memo,
        activityEndAt: team.activityEndAt,
      },
      error: null,
    });
  }),
];
