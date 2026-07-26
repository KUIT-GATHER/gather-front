import { HttpResponse, http } from "msw";

import teams from "./data/teams.json";

import {
  createUnauthorizedResponse,
  getMockUserId,
} from "@/mocks/lib/mockAuth";
import type {
  MeetingCreateRequest,
  MeetingMember,
  MeetingMemberRole,
} from "@/features/team/types/team.types";

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

const createdMeetings: MockMeeting[] = [];
const membershipsByUserId = new Map<number, Map<number, MeetingMemberRole>>([
  [
    1,
    new Map([
      [1, "HOST"],
      [3, "MEMBER"],
    ]),
  ],
]);
const bookmarkedMeetingIdsByUserId = new Map<number, Set<number>>();

const meetingMembersByMeetingId: Record<number, MeetingMember[]> = {
  1: [
    {
      userId: 1,
      nickname: "가더",
      role: "HOST",
      host: true,
    },
    ...Array.from({ length: 11 }, (_, index) => ({
      userId: 101 + index,
      nickname: `팀원 ${index + 1}`,
      role: "MEMBER" as const,
      host: false,
    })),
  ],
};

const meetingPosts = [
  {
    postId: 1,
    meetingId: 1,
    type: "NOTICE",
    title: "오늘도 아이들과 독서 봉사를 다녀왔어요!",
    content: "아이들과 이야기 나누며 책을 읽고 따뜻한 시간을 보냈어요.",
    authorId: 1,
    authorNickname: "가더",
    likeCount: 15,
    commentCount: 5,
    createdAt: "2026-05-11T19:30:00",
  },
  {
    postId: 2,
    meetingId: 1,
    type: "RECRUIT",
    title: "다음 활동에 함께할 팀원을 모집합니다",
    content: "다음 주 활동에 함께해 주세요.",
    authorId: 1,
    authorNickname: "가더",
    likeCount: 7,
    commentCount: 2,
    createdAt: "2026-07-24T18:10:00",
  },
  {
    postId: 3,
    meetingId: 1,
    type: "FREE",
    title: "활동 전 준비물을 확인해 주세요",
    content: "편한 복장과 물을 준비해 주세요.",
    authorId: 101,
    authorNickname: "팀원 1",
    likeCount: 4,
    commentCount: 1,
    createdAt: "2026-07-25T18:10:00",
  },
  {
    postId: 4,
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
        message: "모임을 찾을 수 없습니다.",
      },
    },
    { status: 404 },
  );
}

function createMeetingErrorResponse(
  code: string,
  message: string,
  status: number,
) {
  return HttpResponse.json(
    {
      success: false,
      data: null,
      error: {
        code,
        message,
      },
    },
    { status },
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

function getMembershipRole(userId: number, meetingId: number) {
  return membershipsByUserId.get(userId)?.get(meetingId) ?? null;
}

function addMembership(
  userId: number,
  meetingId: number,
  role: MeetingMemberRole,
) {
  const memberships = membershipsByUserId.get(userId) ?? new Map();

  memberships.set(meetingId, role);
  membershipsByUserId.set(userId, memberships);
}

function getBaseMeetingMembers(team: MockMeeting) {
  const existingMembers = meetingMembersByMeetingId[team.meetingId];

  if (existingMembers) {
    return existingMembers;
  }

  const membershipCount = [...membershipsByUserId.values()].filter(
    (memberships) => memberships.has(team.meetingId),
  ).length;
  const baseMemberCount = Math.max(
    team.currentMemberCount - membershipCount,
    1,
  );

  return [
    {
      userId: team.hostId,
      nickname: "팀장",
      role: "HOST",
      host: true,
    },
    ...Array.from({ length: Math.max(baseMemberCount - 1, 0) }, (_, index) => ({
      userId: team.meetingId * 1000 + index,
      nickname: `팀원 ${index + 1}`,
      role: "MEMBER" as const,
      host: false,
    })),
  ] satisfies MeetingMember[];
}

function getMeetingMembers(team: MockMeeting) {
  const members = [...getBaseMeetingMembers(team)];

  for (const [userId, memberships] of membershipsByUserId) {
    const role = memberships.get(team.meetingId);

    if (!role || members.some((member) => member.userId === userId)) {
      continue;
    }

    members.push({
      userId,
      nickname: userId === 1 ? "가더" : "나",
      role,
      host: role === "HOST",
    });
  }

  return members;
}

function toMeetingListItem(team: MockMeeting) {
  return {
    meetingId: team.meetingId,
    name: team.name,
    description: team.description,
    currentMemberCount: getMeetingMembers(team).length,
    maxMember: team.maxMember,
    regionId: team.regionId,
    category: team.category,
    status: team.status,
    deadline: team.deadline,
    activityStartAt: team.activityStartAt,
  };
}

function findMeeting(meetingId: number) {
  return getMockMeetings().find((team) => team.meetingId === meetingId);
}

export const teamHandlers = [
  http.get("*/api/v1/meetings/my", ({ request }) => {
    const userId = getMockUserId(request);

    if (!userId) {
      return createUnauthorizedResponse();
    }

    const memberships = membershipsByUserId.get(userId) ?? new Map();
    const data = getMockMeetings().flatMap((team) => {
      const viewerRole = memberships.get(team.meetingId);

      return viewerRole ? [{ ...toMeetingListItem(team), viewerRole }] : [];
    });

    return HttpResponse.json({ success: true, data, error: null });
  }),

  http.get("*/api/v1/meetings/keywords/recommended", () => {
    return HttpResponse.json({
      success: true,
      data: ["플로깅", "독서 봉사", "도시락 배달"],
      error: null,
    });
  }),

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
    const userId = getMockUserId(request);

    if (!userId) {
      return createUnauthorizedResponse();
    }

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
    const meeting: MockMeeting = {
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
      hostId: userId,
      volunteerPostingId: body.volunteerPostingId ?? null,
      participationCondition: body.participationCondition ?? null,
      memo: body.memo ?? null,
    };

    createdMeetings.push(meeting);
    addMembership(userId, meetingId, "HOST");

    return HttpResponse.json({
      success: true,
      data: toMeetingListItem(meeting),
      error: null,
    });
  }),

  http.get("*/api/v1/meetings/:meetingId/home", ({ params, request }) => {
    const meetingId = Number(params.meetingId);
    const team = findMeeting(meetingId);

    if (!team) {
      return createMeetingNotFoundResponse();
    }

    const userId = getMockUserId(request);
    const viewerRole = userId ? getMembershipRole(userId, meetingId) : null;
    const members = getMeetingMembers(team);

    return HttpResponse.json({
      success: true,
      data: {
        meetingId: team.meetingId,
        name: team.name,
        description: team.description,
        deadline: team.deadline,
        regionName: team.regionName,
        currentMemberCount: members.length,
        maxMember: team.maxMember,
        timeVerified: false,
        status: team.status,
        basedOnPosting: team.volunteerPostingId !== null,
        linkedPostingId: team.volunteerPostingId,
        linkedPostingTitle: null,
        participationCondition: team.participationCondition,
        members,
        upcomingActivity:
          team.volunteerPostingId === 1
            ? {
                postingId: 1,
                title: "한강공원 플로깅 봉사",
                activityDate: "2026-07-20",
                startTime: "10:00",
                endTime: "13:00",
                place: "여의도 한강공원",
                remainingCount: 12,
                status: "RECRUITING",
              }
            : null,
        member: viewerRole !== null,
        host: viewerRole === "HOST",
      },
      error: null,
    });
  }),

  http.get("*/api/v1/meetings/:meetingId/posts", ({ params, request }) => {
    const userId = getMockUserId(request);

    if (!userId) {
      return createUnauthorizedResponse();
    }

    const meetingId = Number(params.meetingId);
    const team = findMeeting(meetingId);
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

    const isJoined = getMembershipRole(userId, meetingId) !== null;
    const posts = meetingPosts
      .filter((post) => post.meetingId === meetingId)
      .filter(
        (post) => isJoined || post.type === "NOTICE" || post.type === "REVIEW",
      )
      .filter((post) => !type || post.type === type);

    return HttpResponse.json({ success: true, data: posts, error: null });
  }),

  http.post("*/api/v1/meetings/:meetingId/join", ({ params, request }) => {
    const userId = getMockUserId(request);

    if (!userId) {
      return createUnauthorizedResponse();
    }

    const meetingId = Number(params.meetingId);
    const team = findMeeting(meetingId);

    if (!team) {
      return createMeetingNotFoundResponse();
    }

    if (team.status !== "RECRUITING") {
      return createMeetingErrorResponse(
        "MEETING_CLOSED",
        "모집이 마감된 모임입니다.",
        409,
      );
    }

    if (getMeetingMembers(team).length >= team.maxMember) {
      return createMeetingErrorResponse(
        "MEETING_FULL",
        "모임 정원이 가득 찼습니다.",
        409,
      );
    }

    if (getMembershipRole(userId, meetingId)) {
      return createMeetingErrorResponse(
        "MEETING_ALREADY_JOINED",
        "이미 가입한 모임입니다.",
        409,
      );
    }

    addMembership(userId, meetingId, "MEMBER");
    team.currentMemberCount += 1;

    return HttpResponse.json({
      success: true,
      data: toMeetingListItem(team),
      error: null,
    });
  }),

  http.post("*/api/v1/meetings/:meetingId/bookmark", ({ params, request }) => {
    const userId = getMockUserId(request);

    if (!userId) {
      return createUnauthorizedResponse();
    }

    const meetingId = Number(params.meetingId);
    const team = findMeeting(meetingId);

    if (!team) {
      return createMeetingNotFoundResponse();
    }

    const bookmarkedMeetingIds =
      bookmarkedMeetingIdsByUserId.get(userId) ?? new Set<number>();

    if (bookmarkedMeetingIds.has(meetingId)) {
      return createMeetingErrorResponse(
        "MEETING_BOOKMARK_DUPLICATE",
        "이미 북마크한 모임입니다.",
        409,
      );
    }

    bookmarkedMeetingIds.add(meetingId);
    bookmarkedMeetingIdsByUserId.set(userId, bookmarkedMeetingIds);

    return HttpResponse.json({
      success: true,
      data: { meetingId, bookmarked: true },
      error: null,
    });
  }),

  http.delete(
    "*/api/v1/meetings/:meetingId/bookmark",
    ({ params, request }) => {
      const userId = getMockUserId(request);

      if (!userId) {
        return createUnauthorizedResponse();
      }

      const meetingId = Number(params.meetingId);
      const team = findMeeting(meetingId);

      if (!team) {
        return createMeetingNotFoundResponse();
      }

      const bookmarkedMeetingIds = bookmarkedMeetingIdsByUserId.get(userId);

      if (!bookmarkedMeetingIds?.has(meetingId)) {
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
        data: { meetingId, bookmarked: false },
        error: null,
      });
    },
  ),

  http.get("*/api/v1/meetings/:meetingId", ({ params, request }) => {
    const meetingId = Number(params.meetingId);
    const team = findMeeting(meetingId);

    if (!team) {
      return createMeetingNotFoundResponse();
    }

    const userId = getMockUserId(request);
    const bookmarked = userId
      ? (bookmarkedMeetingIdsByUserId.get(userId)?.has(meetingId) ?? false)
      : false;

    return HttpResponse.json({
      success: true,
      data: {
        ...toMeetingListItem(team),
        hostId: team.hostId,
        volunteerPostingId: team.volunteerPostingId,
        participationCondition: team.participationCondition,
        memo: team.memo,
        activityEndAt: team.activityEndAt,
        bookmarked,
      },
      error: null,
    });
  }),
];
