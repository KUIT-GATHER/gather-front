import { HttpResponse, http } from "msw";

import teams from "./data/teams.json";

import type { MeetingCreateRequest } from "@/features/team/types/team.types";

const MEETING_STATUSES = new Set(["RECRUITING", "CLOSED", "COMPLETED"]);
const POSTING_CATEGORIES = new Set([
  "ENVIRONMENT",
  "EDUCATION",
  "CULTURE",
  "COMMUNITY",
  "WELFARE",
  "OVERSEAS",
]);
const SORTABLE_MEETING_FIELDS = [
  "id",
  "name",
  "currentMemberCount",
  "maxMember",
  "regionId",
  "category",
  "status",
  "deadline",
  "activityStartAt",
  "activityEndAt",
  "createdAt",
  "updatedAt",
] as const;

type MeetingSortField = (typeof SORTABLE_MEETING_FIELDS)[number];
type MeetingSort = {
  field: MeetingSortField;
  direction: "asc" | "desc";
};

type MockMeeting = {
  meetingId: number;
  name: string;
  description: string | null;
  currentMemberCount: number;
  maxMember: number;
  regionId: number;
  regionName: string;
  category: string;
  status: string;
  deadline: string;
  activityStartAt: string;
  activityEndAt: string;
  hostId: number;
  volunteerPostingId: number | null;
  participationCondition: string | null;
  memo: string | null;
};

const bookmarkedMeetingIds = new Set<number>();
const joinedMeetingIds = new Set<number>();
const createdMeetings: MockMeeting[] = [];

const meetingPosts = [
  {
    postId: 1,
    meetingId: 1,
    type: "NOTICE",
    title: "오늘도 아이들과 독서 봉사를 다녀왔어요!",
    content: "아이들과 이야기 나누며 책을 읽고 따뜻한 시간을 보냈어요.",
    authorId: 1,
    authorNickname: "김수민",
    likeCount: 15,
    commentCount: 5,
    createdAt: "2026-05-11T19:30:00",
  },
  {
    postId: 2,
    meetingId: 2,
    type: "REVIEW",
    title: "첫 활동 후기",
    content: "처음 참여했는데 편하게 함께할 수 있었어요.",
    authorId: 2,
    authorNickname: "이하늘",
    likeCount: 7,
    commentCount: 2,
    createdAt: "2026-07-24T18:10:00",
  },
] as const;

function createMeetingNotFoundResponse() {
  return HttpResponse.json(
    {
      success: false,
      data: null,
      error: {
        code: "MEETING_NOT_FOUND",
        message: "Meeting not found.",
      },
    },
    { status: 404 },
  );
}

function getOptionalNumberParam(url: URL, key: string) {
  const rawValue = url.searchParams.get(key);

  if (!rawValue || rawValue.trim() === "") {
    return undefined;
  }

  const value = Number(rawValue);

  return Number.isInteger(value) ? value : undefined;
}

function getPageParam(url: URL) {
  const page = getOptionalNumberParam(url, "page");

  return page !== undefined && page >= 0 ? page : 0;
}

function getSizeParam(url: URL) {
  const size = getOptionalNumberParam(url, "size");

  return size !== undefined && size > 0 ? size : 10;
}

function parseSorts(url: URL): MeetingSort[] | null {
  const rawSorts = url.searchParams.getAll("sort");

  if (rawSorts.length === 0) {
    return [{ field: "createdAt", direction: "desc" }];
  }

  return rawSorts.reduce<MeetingSort[] | null>((sorts, rawSort) => {
    if (!sorts) {
      return null;
    }

    const [field, direction = "asc"] = rawSort.split(",");

    if (
      !SORTABLE_MEETING_FIELDS.includes(field as MeetingSortField) ||
      (direction !== "asc" && direction !== "desc")
    ) {
      return null;
    }

    sorts.push({ field: field as MeetingSortField, direction });
    return sorts;
  }, []);
}

function getSortValue(team: MockMeeting, field: MeetingSortField) {
  if (field === "id" || field === "createdAt" || field === "updatedAt") {
    return team.meetingId;
  }

  return team[field];
}

function sortMeetings(items: MockMeeting[], sorts: MeetingSort[]) {
  return [...items].sort((left, right) => {
    for (const { field, direction } of sorts) {
      const leftValue = getSortValue(left, field);
      const rightValue = getSortValue(right, field);
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

function getMockMeetings() {
  return [...(teams.data as MockMeeting[]), ...createdMeetings];
}

function toMeetingListItem(team: MockMeeting) {
  const joined = joinedMeetingIds.has(team.meetingId);

  return {
    meetingId: team.meetingId,
    name: team.name,
    description: team.description,
    currentMemberCount: team.currentMemberCount + (joined ? 1 : 0),
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
    const page = getPageParam(url);
    const size = getSizeParam(url);
    const sorts = parseSorts(url);

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

    let items = getMockMeetings();

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

    const sortedItems = sortMeetings(items, sorts);
    const startIndex = page * size;
    const content = sortedItems
      .slice(startIndex, startIndex + size)
      .map(toMeetingListItem);

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

  http.post("*/api/v1/meetings", async ({ request }) => {
    const body = (await request.json()) as Partial<MeetingCreateRequest>;

    if (
      !body.name ||
      typeof body.maxMember !== "number" ||
      typeof body.regionId !== "number" ||
      !body.deadline ||
      !body.activityStartAt ||
      !body.activityEndAt
    ) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid meeting create request.",
          },
        },
        { status: 400 },
      );
    }

    const meetingId =
      Math.max(...getMockMeetings().map((team) => team.meetingId), 0) + 1;
    const meeting = {
      meetingId,
      name: body.name,
      description: body.description ?? null,
      currentMemberCount: 1,
      maxMember: body.maxMember,
      regionId: body.regionId,
      regionName: "",
      category: body.category ?? "COMMUNITY",
      status: "RECRUITING",
      deadline: body.deadline,
      activityStartAt: body.activityStartAt,
      activityEndAt: body.activityEndAt,
      hostId: 1,
      volunteerPostingId: body.volunteerPostingId ?? null,
      participationCondition: body.participationCondition ?? null,
      memo: body.memo ?? null,
    };

    createdMeetings.push(meeting);

    return HttpResponse.json({
      success: true,
      data: toMeetingListItem(meeting),
      error: null,
    });
  }),

  http.get("*/api/v1/meetings/:meetingId/home", ({ params }) => {
    const meetingId = Number(params.meetingId);
    const team = getMockMeetings().find((item) => item.meetingId === meetingId);

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

    const joined = joinedMeetingIds.has(meetingId);

    return HttpResponse.json({
      success: true,
      data: {
        meetingId: team.meetingId,
        name: team.name,
        description: team.description,
        deadline: team.deadline,
        regionName: team.regionName,
        currentMemberCount: team.currentMemberCount + (joined ? 1 : 0),
        maxMember: team.maxMember,
        timeVerified: false,
        status: team.status,
        basedOnPosting: team.volunteerPostingId !== null,
        linkedPostingId: team.volunteerPostingId,
        linkedPostingTitle: null,
        participationCondition: team.participationCondition,
        members: [
          {
            userId: team.hostId,
            nickname: "팀장",
            role: "HOST",
            host: true,
          },
          ...(joined
            ? [
                {
                  userId: 99,
                  nickname: "나",
                  role: "MEMBER",
                  host: false,
                },
              ]
            : []),
        ],
        upcomingActivity: null,
        member: joined,
        host: false,
      },
      error: null,
    });
  }),

  http.get("*/api/v1/meetings/:meetingId/posts", ({ params, request }) => {
    const meetingId = Number(params.meetingId);
    const team = getMockMeetings().find((item) => item.meetingId === meetingId);
    const url = new URL(request.url);
    const type = url.searchParams.get("type");

    if (!team) {
      return createMeetingNotFoundResponse();
    }

    if (
      type &&
      type !== "NOTICE" &&
      type !== "REVIEW" &&
      type !== "RECRUIT" &&
      type !== "FREE"
    ) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid post type.",
          },
        },
        { status: 400 },
      );
    }

    const posts = meetingPosts
      .filter((post) => post.meetingId === meetingId)
      .filter((post) => !type || post.type === type)
      .map((post) => ({
        postId: post.postId,
        type: post.type,
        title: post.title,
        content: post.content,
        authorId: post.authorId,
        authorNickname: post.authorNickname,
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        createdAt: post.createdAt,
      }));

    return HttpResponse.json({
      success: true,
      data: posts,
      error: null,
    });
  }),

  http.post("*/api/v1/meetings/:meetingId/join", ({ params }) => {
    const meetingId = Number(params.meetingId);
    const team = getMockMeetings().find((item) => item.meetingId === meetingId);

    if (!team) {
      return createMeetingNotFoundResponse();
    }

    joinedMeetingIds.add(meetingId);

    return HttpResponse.json({
      success: true,
      data: toMeetingListItem(team),
      error: null,
    });
  }),

  http.get("*/api/v1/meetings/:meetingId", ({ params }) => {
    const meetingId = Number(params.meetingId);
    const team = getMockMeetings().find((item) => item.meetingId === meetingId);

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
        bookmarked: bookmarkedMeetingIds.has(meetingId),
      },
      error: null,
    });
  }),

  http.post("*/api/v1/meetings/:meetingId/bookmark", ({ params }) => {
    const meetingId = Number(params.meetingId);
    const team = getMockMeetings().find((item) => item.meetingId === meetingId);

    if (!team) {
      return createMeetingNotFoundResponse();
    }

    if (bookmarkedMeetingIds.has(meetingId)) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "MEETING_BOOKMARK_DUPLICATE",
            message: "Meeting already bookmarked.",
          },
        },
        { status: 409 },
      );
    }

    bookmarkedMeetingIds.add(meetingId);

    return HttpResponse.json({
      success: true,
      data: {
        meetingId,
        bookmarked: true,
      },
      error: null,
    });
  }),

  http.delete("*/api/v1/meetings/:meetingId/bookmark", ({ params }) => {
    const meetingId = Number(params.meetingId);
    const team = getMockMeetings().find((item) => item.meetingId === meetingId);

    if (!team) {
      return createMeetingNotFoundResponse();
    }

    if (!bookmarkedMeetingIds.has(meetingId)) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "MEETING_BOOKMARK_NOT_FOUND",
            message: "Meeting bookmark not found.",
          },
        },
        { status: 404 },
      );
    }

    bookmarkedMeetingIds.delete(meetingId);

    return HttpResponse.json({
      success: true,
      data: {
        meetingId,
        bookmarked: false,
      },
      error: null,
    });
  }),
];
