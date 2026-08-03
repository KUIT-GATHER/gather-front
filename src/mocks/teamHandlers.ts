import { HttpResponse, http } from "msw";

import mockPostImageOne from "@/assets/icons/Temp-volunteer-posting.svg";
import mockPostImageThree from "@/assets/onboarding/onboarding-step2-center.svg";
import mockPostImageTwo from "@/assets/onboarding/onboarding-step1-center.svg";
import teams from "./data/teams.json";
import { getMockUserById } from "./data/mockUsers";

import {
  createUnauthorizedResponse,
  getMockUserId,
} from "@/mocks/lib/mockAuth";
import { isLocalDateTimeApiValue } from "@/shared/lib/localDateTime";
import type {
  MeetingCreateRequest,
  MeetingMember,
  MeetingMemberRole,
  MeetingPostType,
} from "@/features/team/types/team.types";
import {
  MAX_MEETING_IMAGE_COUNT,
  MAX_MEETING_IMAGE_SIZE_BYTES,
  isMeetingImageMimeType,
} from "@/features/team/lib/meetingImageValidation";
import type {
  MeetingImagePresignedUrlRequest,
  MeetingImageUpdateRequest,
} from "@/features/team/types/meetingImage.types";

const MEETING_STATUSES = new Set(["RECRUITING", "CLOSED", "COMPLETED"]);
const RECOMMENDATION_COUNT = 5;
const RECOMMENDATION_DEADLINE_WINDOW_DAYS = 30;
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
const MEETING_POST_TYPES = new Set(["NOTICE", "REVIEW", "RECRUIT", "FREE"]);
const SORTABLE_MEETING_POST_FIELDS = ["createdAt", "id"] as const;

type MeetingSortField = (typeof SORTABLE_MEETING_FIELDS)[number];
type MeetingSort = {
  field: MeetingSortField;
  direction: "asc" | "desc";
};
type MeetingPostSortField = (typeof SORTABLE_MEETING_POST_FIELDS)[number];
type MeetingPostSort = {
  field: MeetingPostSortField;
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
  categories: string[];
  status: string;
  deadline: string;
  activityStartAt: string | null;
  activityEndAt: string | null;
  hostId: number;
  volunteerPostingId: number | null;
  participationCondition: string | null;
  memo: string | null;
};

type MockMeetingPost = {
  postId: number;
  meetingId: number;
  type: MeetingPostType;
  title: string;
  content: string;
  authorId: number;
  authorNickname: string;
  imageUrls: string[];
  likeCount: number;
  commentCount: number;
  likedUserIds: number[];
  createdAt: string;
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

function formatMockDateTime(value: string, offsetDays: number) {
  const time = value.split("T")[1];

  return `${formatMockDate(offsetDays)}T${time}`;
}

const recruitmentDeadlineOffsets = new Map([
  [1, 1],
  [2, 3],
  [3, 5],
  [5, 7],
  [7, 10],
  [8, 14],
  [9, 21],
]);
const baseMockMeetings = teams.data.map((team) => {
  const deadlineOffset = recruitmentDeadlineOffsets.get(team.meetingId);

  if (team.status !== "RECRUITING" || deadlineOffset === undefined) {
    return team;
  }

  return {
    ...team,
    deadline: formatMockDateTime(team.deadline, deadlineOffset),
    activityStartAt: formatMockDateTime(
      team.activityStartAt,
      deadlineOffset + 2,
    ),
    activityEndAt: formatMockDateTime(team.activityEndAt, deadlineOffset + 2),
  };
});

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
const pendingMeetingImageUploads = new Map<
  string,
  {
    meetingId: number;
    ownerId: number;
    objectKey: string;
    publicUrl: string;
    contentType: string;
    fileSize: number;
    uploaded: boolean;
    applied: boolean;
  }
>();
const meetingImageUrlsByMeetingId = new Map<number, string[]>();
const uploadedMockObjects = new Map<
  string,
  { meetingId: number; publicUrl: string; uploadId: string }
>();
let nextMeetingImageUploadId = 1;
const mockPostImageUrls = [
  mockPostImageOne,
  mockPostImageTwo,
  mockPostImageThree,
] as const;

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

const meetingPosts: MockMeetingPost[] = [
  {
    postId: 1,
    meetingId: 1,
    type: "NOTICE",
    title: "오늘도 아이들과 독서 봉사를 다녀왔어요!",
    content: "아이들과 이야기 나누며 책을 읽고 따뜻한 시간을 보냈어요.",
    authorId: 1,
    authorNickname: "가더",
    imageUrls: [...mockPostImageUrls],
    likeCount: 15,
    commentCount: 5,
    likedUserIds: [1],
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
    imageUrls: [mockPostImageOne],
    likeCount: 7,
    commentCount: 2,
    likedUserIds: [],
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
    imageUrls: [],
    likeCount: 4,
    commentCount: 1,
    likedUserIds: [1],
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
    imageUrls: [],
    likeCount: 7,
    commentCount: 2,
    likedUserIds: [],
    createdAt: "2026-07-24T18:10:00",
  },
];

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

function createPostNotFoundResponse() {
  return HttpResponse.json(
    {
      success: false,
      data: null,
      error: {
        code: "POST_NOT_FOUND",
        message: "게시글을 찾을 수 없습니다.",
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

function getMeetingPostSizeParam(url: URL) {
  const size = getOptionalNumberParam(url, "size");

  return size !== undefined && size > 0 ? size : 20;
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

function parseMeetingPostSorts(url: URL): MeetingPostSort[] | null {
  const rawSorts = url.searchParams.getAll("sort");

  if (rawSorts.length === 0) {
    return [
      { field: "createdAt", direction: "desc" },
      { field: "id", direction: "desc" },
    ];
  }

  return rawSorts.reduce<MeetingPostSort[] | null>((sorts, rawSort) => {
    if (!sorts) {
      return null;
    }

    const [field, direction = "asc"] = rawSort.split(",");

    if (
      !SORTABLE_MEETING_POST_FIELDS.includes(field as MeetingPostSortField) ||
      (direction !== "asc" && direction !== "desc")
    ) {
      return null;
    }

    sorts.push({ field: field as MeetingPostSortField, direction });
    return sorts;
  }, []);
}

function getSortValue(team: MockMeeting, field: MeetingSortField) {
  if (field === "id" || field === "createdAt" || field === "updatedAt") {
    return team.meetingId;
  }

  if (field === "category") {
    return team.categories[0] ?? "";
  }

  return team[field];
}

function getMeetingPostSortValue(
  post: MockMeetingPost,
  field: MeetingPostSortField,
) {
  return field === "id" ? post.postId : post.createdAt;
}

function isMeetingRecruiting(team: MockMeeting) {
  const now = new Date();
  const deadline = new Date(team.deadline);
  const activityEndAt = team.activityEndAt
    ? new Date(team.activityEndAt)
    : null;

  return (
    team.status === "RECRUITING" &&
    deadline.getTime() > now.getTime() &&
    (!activityEndAt || activityEndAt.getTime() > now.getTime()) &&
    getMeetingMembers(team).length < team.maxMember
  );
}

function getMockMeetingRecommendationScore(
  team: MockMeeting,
  preferredCategories: readonly string[],
) {
  const deadline = new Date(team.deadline);
  const now = new Date();
  const daysUntilDeadline = Math.round(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  const categoryScore = team.categories.some((category) =>
    preferredCategories.includes(category),
  )
    ? 1
    : 0;
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

function parseLocalDateStart(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : undefined;
}

function getNextLocalDateStart(value: string) {
  const date = parseLocalDateStart(value);

  if (!date) {
    return undefined;
  }

  date.setDate(date.getDate() + 1);
  return date;
}

function overlapsActivityPeriod(
  team: MockMeeting,
  activityStartDate?: string,
  activityEndDate?: string,
) {
  if (!team.activityStartAt || !team.activityEndAt) {
    return false;
  }

  const selectedStartAt = activityStartDate
    ? parseLocalDateStart(activityStartDate)
    : undefined;
  const selectedEndAtExclusive = activityEndDate
    ? getNextLocalDateStart(activityEndDate)
    : undefined;
  const teamActivityStartAt = new Date(team.activityStartAt);
  const teamActivityEndAt = new Date(team.activityEndAt);

  if (
    Number.isNaN(teamActivityStartAt.getTime()) ||
    Number.isNaN(teamActivityEndAt.getTime())
  ) {
    return false;
  }

  return (
    (!selectedStartAt || teamActivityEndAt >= selectedStartAt) &&
    (!selectedEndAtExclusive || teamActivityStartAt < selectedEndAtExclusive)
  );
}

function sortMeetingsWithPostingFirst(
  items: MockMeeting[],
  sorts: MeetingSort[],
  postingBasedFirst: boolean,
) {
  return [...items].sort((left, right) => {
    if (postingBasedFirst) {
      const leftIsPostingBased = left.volunteerPostingId !== null;
      const rightIsPostingBased = right.volunteerPostingId !== null;

      if (leftIsPostingBased !== rightIsPostingBased) {
        return leftIsPostingBased ? -1 : 1;
      }
    }

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

function sortMeetingPosts(items: MockMeetingPost[], sorts: MeetingPostSort[]) {
  return [...items].sort((left, right) => {
    for (const { field, direction } of sorts) {
      const leftValue = getMeetingPostSortValue(left, field);
      const rightValue = getMeetingPostSortValue(right, field);
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

function toMeetingPostSummary(post: MockMeetingPost, viewerUserId: number) {
  return {
    postId: post.postId,
    type: post.type,
    title: post.title,
    content: post.content,
    authorId: post.authorId,
    authorNickname: post.authorNickname,
    imageUrls: post.imageUrls,
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    liked: post.likedUserIds.includes(viewerUserId),
    createdAt: post.createdAt,
  };
}

function toMeetingPostDetail(
  post: MockMeetingPost,
  viewerUserId: number,
  team: MockMeeting,
) {
  return {
    ...toMeetingPostSummary(post, viewerUserId),
    meetingId: post.meetingId,
    recruitCapacity: post.type === "RECRUIT" ? 3 : null,
    canEdit: post.authorId === viewerUserId,
    canDelete: post.authorId === viewerUserId || team.hostId === viewerUserId,
    updatedAt: post.createdAt,
  };
}

function getMockMeetings() {
  return [...(baseMockMeetings as MockMeeting[]), ...createdMeetings];
}

function getRecommendedMockMeetings(userId: number | null) {
  const user = userId === null ? null : getMockUserById(userId);
  const preferredCategories = user?.interestCategories ?? [];
  const joinedMeetingIds = user
    ? new Set(membershipsByUserId.get(user.id)?.keys() ?? [])
    : new Set<number>();

  return getMockMeetings()
    .filter(isMeetingRecruiting)
    .filter((team) => !joinedMeetingIds.has(team.meetingId))
    .sort((left, right) => {
      const scoreComparison =
        getMockMeetingRecommendationScore(right, preferredCategories) -
        getMockMeetingRecommendationScore(left, preferredCategories);

      if (scoreComparison !== 0) {
        return scoreComparison;
      }

      const deadlineComparison =
        new Date(left.deadline).getTime() - new Date(right.deadline).getTime();

      return deadlineComparison !== 0
        ? deadlineComparison
        : left.meetingId - right.meetingId;
    })
    .slice(0, RECOMMENDATION_COUNT)
    .map(toMeetingListItem);
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
    categories: team.categories,
    status: team.status,
    deadline: team.deadline,
    activityStartAt: team.activityStartAt,
  };
}

function findMeeting(meetingId: number) {
  return getMockMeetings().find((team) => team.meetingId === meetingId);
}

function createMeetingImageForbiddenResponse() {
  return createMeetingErrorResponse(
    "MEETING_IMAGE_FORBIDDEN",
    "모임장만 사진을 등록할 수 있습니다.",
    403,
  );
}

function getPendingUploadCount(meetingId: number) {
  return [...pendingMeetingImageUploads.values()].filter(
    (upload) => upload.meetingId === meetingId && !upload.applied,
  ).length;
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

  http.get("*/api/v1/meetings/recommended", ({ request }) => {
    return HttpResponse.json({
      success: true,
      data: getRecommendedMockMeetings(getMockUserId(request)),
      error: null,
    });
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
    const activityStartDate = url.searchParams.get("activityStartDate");
    const activityEndDate = url.searchParams.get("activityEndDate");
    const postingBasedFirst =
      url.searchParams.get("postingBasedFirst") === "true";
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
      items = items.filter((team) => team.categories.includes(category));
    }

    if (status) {
      items = items.filter((team) =>
        status === "RECRUITING"
          ? isMeetingRecruiting(team)
          : team.status === status,
      );
    }

    if (activityStartDate || activityEndDate) {
      items = items.filter((team) =>
        overlapsActivityPeriod(
          team,
          activityStartDate ?? undefined,
          activityEndDate ?? undefined,
        ),
      );
    }

    const sortedItems = sortMeetingsWithPostingFirst(
      items,
      sorts,
      postingBasedFirst,
    );
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

    const isPostingBased = body.volunteerPostingId != null;
    const activitySchedule = isPostingBased
      ? isLocalDateTimeApiValue(body.activityStartAt) &&
        isLocalDateTimeApiValue(body.activityEndAt)
        ? {
            activityStartAt: body.activityStartAt,
            activityEndAt: body.activityEndAt,
          }
        : undefined
      : body.activityStartAt === null && body.activityEndAt === null
        ? {
            activityStartAt: null,
            activityEndAt: null,
          }
        : undefined;

    if (
      !body.name ||
      typeof body.maxMember !== "number" ||
      typeof body.regionId !== "number" ||
      !body.categories ||
      body.categories.length < 1 ||
      body.categories.length > 3 ||
      !isLocalDateTimeApiValue(body.deadline) ||
      !activitySchedule
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
      categories: body.categories,
      status: "RECRUITING",
      deadline: body.deadline,
      activityStartAt: activitySchedule.activityStartAt,
      activityEndAt: activitySchedule.activityEndAt,
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

  http.post(
    "*/api/v1/meetings/:meetingId/images/presigned-url",
    async ({ params, request }) => {
      const userId = getMockUserId(request);

      if (!userId) {
        return createUnauthorizedResponse();
      }

      const meetingId = Number(params.meetingId);
      const meeting = findMeeting(meetingId);

      if (!meeting) {
        return createMeetingNotFoundResponse();
      }

      if (meeting.hostId !== userId) {
        return createMeetingImageForbiddenResponse();
      }

      const body =
        (await request.json()) as Partial<MeetingImagePresignedUrlRequest>;
      const contentType = body.contentType;
      const fileSize = body.fileSize;

      if (!contentType || !isMeetingImageMimeType(contentType)) {
        return createMeetingErrorResponse(
          "UNSUPPORTED_MEETING_IMAGE_TYPE",
          "지원하지 않는 이미지 형식입니다.",
          400,
        );
      }

      if (
        typeof fileSize !== "number" ||
        fileSize <= 0 ||
        fileSize > MAX_MEETING_IMAGE_SIZE_BYTES
      ) {
        return createMeetingErrorResponse(
          "MEETING_IMAGE_SIZE_EXCEEDED",
          "이미지 크기가 제한을 초과했습니다.",
          400,
        );
      }

      if (getPendingUploadCount(meetingId) >= MAX_MEETING_IMAGE_COUNT) {
        return createMeetingErrorResponse(
          "MEETING_IMAGE_UPLOAD_LIMIT_EXCEEDED",
          "대기 중인 이미지 업로드 요청이 너무 많습니다.",
          429,
        );
      }

      const uploadId = String(nextMeetingImageUploadId++);
      const extension = contentType.split("/")[1];
      const objectKey = `meetings/${meetingId}/mock-${uploadId}.${extension}`;
      const publicUrl = `https://mock-s3.gather.local/${objectKey}`;

      pendingMeetingImageUploads.set(uploadId, {
        meetingId,
        ownerId: userId,
        objectKey,
        publicUrl,
        contentType,
        fileSize,
        uploaded: false,
        applied: false,
      });

      return HttpResponse.json({
        success: true,
        data: {
          uploadUrl: `http://localhost:5173/__mock-s3/meeting-images/${uploadId}`,
          objectKey,
          publicUrl,
          expiresInSeconds: 300,
        },
        error: null,
      });
    },
  ),

  http.put(
    "*/__mock-s3/meeting-images/:uploadId",
    async ({ params, request }) => {
      const upload = pendingMeetingImageUploads.get(String(params.uploadId));

      if (!upload) {
        return new HttpResponse(null, { status: 404 });
      }

      if (upload.uploaded) {
        return new HttpResponse(null, { status: 412 });
      }

      if (
        request.headers.get("Content-Type") !== upload.contentType ||
        request.headers.get("If-None-Match") !== "*"
      ) {
        return new HttpResponse(null, { status: 400 });
      }

      const fileSize = (await request.arrayBuffer()).byteLength;

      if (fileSize !== upload.fileSize) {
        return new HttpResponse(null, { status: 400 });
      }

      upload.uploaded = true;
      uploadedMockObjects.set(upload.objectKey, {
        meetingId: upload.meetingId,
        publicUrl: upload.publicUrl,
        uploadId: String(params.uploadId),
      });

      return new HttpResponse(null, { status: 200 });
    },
  ),

  http.patch(
    "*/api/v1/meetings/:meetingId/images",
    async ({ params, request }) => {
      const userId = getMockUserId(request);

      if (!userId) {
        return createUnauthorizedResponse();
      }

      const meetingId = Number(params.meetingId);
      const meeting = findMeeting(meetingId);

      if (!meeting) {
        return createMeetingNotFoundResponse();
      }

      if (meeting.hostId !== userId) {
        return createMeetingImageForbiddenResponse();
      }

      const body = (await request.json()) as Partial<MeetingImageUpdateRequest>;
      const objectKeys = body.objectKeys;

      if (
        !Array.isArray(objectKeys) ||
        objectKeys.length > MAX_MEETING_IMAGE_COUNT
      ) {
        return createMeetingErrorResponse(
          "MEETING_IMAGE_COUNT_EXCEEDED",
          "모임 사진은 최대 3장까지 등록할 수 있습니다.",
          400,
        );
      }

      if (new Set(objectKeys).size !== objectKeys.length) {
        return createMeetingErrorResponse(
          "MEETING_IMAGE_CONFLICT",
          "동일한 사진을 중복 등록할 수 없습니다.",
          409,
        );
      }

      const uploadedObjects = objectKeys.map((objectKey) =>
        uploadedMockObjects.get(objectKey),
      );

      if (
        uploadedObjects.some(
          (uploadedObject) =>
            !uploadedObject || uploadedObject.meetingId !== meetingId,
        )
      ) {
        return createMeetingErrorResponse(
          "MEETING_IMAGE_OBJECT_NOT_FOUND",
          "업로드된 이미지를 찾을 수 없습니다.",
          404,
        );
      }

      objectKeys.forEach((objectKey) => {
        const upload = [...pendingMeetingImageUploads.values()].find(
          (pendingUpload) => pendingUpload.objectKey === objectKey,
        );

        if (upload) {
          upload.applied = true;
        }
      });

      const imageUrls = uploadedObjects.map(
        (uploadedObject) => uploadedObject!.publicUrl,
      );
      meetingImageUrlsByMeetingId.set(meetingId, imageUrls);

      return HttpResponse.json({
        success: true,
        data: { imageUrls },
        error: null,
      });
    },
  ),

  http.get("*/api/v1/meetings/:meetingId/images", ({ params }) => {
    const meetingId = Number(params.meetingId);

    if (!findMeeting(meetingId)) {
      return createMeetingNotFoundResponse();
    }

    return HttpResponse.json({
      success: true,
      data: { imageUrls: meetingImageUrlsByMeetingId.get(meetingId) ?? [] },
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
    const page = getPageParam(url);
    const size = getMeetingPostSizeParam(url);
    const sorts = parseMeetingPostSorts(url);

    if (!team) {
      return createMeetingNotFoundResponse();
    }

    if (type && !MEETING_POST_TYPES.has(type)) {
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

    if (!sorts) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid post sort.",
          },
        },
        { status: 400 },
      );
    }

    const isJoined = getMembershipRole(userId, meetingId) !== null;
    const posts = sortMeetingPosts(
      meetingPosts
        .filter((post) => post.meetingId === meetingId)
        .filter(
          (post) =>
            isJoined || post.type === "NOTICE" || post.type === "REVIEW",
        )
        .filter((post) => !type || post.type === type),
      sorts,
    );
    const startIndex = page * size;
    const content = posts
      .slice(startIndex, startIndex + size)
      .map((post) => toMeetingPostSummary(post, userId));

    return HttpResponse.json({
      success: true,
      data: {
        content,
        totalElements: posts.length,
        totalPages: Math.ceil(posts.length / size),
        page,
        size,
      },
      error: null,
    });
  }),

  http.get(
    "*/api/v1/meetings/:meetingId/posts/:postId",
    ({ params, request }) => {
      const userId = getMockUserId(request);

      if (!userId) {
        return createUnauthorizedResponse();
      }

      const meetingId = Number(params.meetingId);
      const postId = Number(params.postId);
      const team = findMeeting(meetingId);

      if (!team) {
        return createMeetingNotFoundResponse();
      }

      const post = meetingPosts.find(
        (meetingPost) =>
          meetingPost.meetingId === meetingId && meetingPost.postId === postId,
      );

      if (!post) {
        return createPostNotFoundResponse();
      }

      const isJoined = getMembershipRole(userId, meetingId) !== null;

      if (!isJoined && post.type !== "NOTICE" && post.type !== "REVIEW") {
        return createMeetingErrorResponse(
          "POST_ACCESS_DENIED",
          "접근할 수 없는 게시글입니다.",
          403,
        );
      }

      return HttpResponse.json({
        success: true,
        data: toMeetingPostDetail(post, userId, team),
        error: null,
      });
    },
  ),

  http.delete(
    "*/api/v1/meetings/:meetingId/posts/:postId",
    ({ params, request }) => {
      const userId = getMockUserId(request);

      if (!userId) {
        return createUnauthorizedResponse();
      }

      const meetingId = Number(params.meetingId);
      const postId = Number(params.postId);
      const team = findMeeting(meetingId);

      if (!team) {
        return createMeetingNotFoundResponse();
      }

      const postIndex = meetingPosts.findIndex(
        (meetingPost) =>
          meetingPost.meetingId === meetingId && meetingPost.postId === postId,
      );

      if (postIndex === -1) {
        return createPostNotFoundResponse();
      }

      const post = meetingPosts[postIndex];

      if (post.authorId !== userId && team.hostId !== userId) {
        return createMeetingErrorResponse(
          "POST_FORBIDDEN",
          "게시글을 삭제할 권한이 없습니다.",
          403,
        );
      }

      meetingPosts.splice(postIndex, 1);

      return HttpResponse.json({
        success: true,
        data: null,
        error: null,
      });
    },
  ),

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
