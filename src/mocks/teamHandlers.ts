import { HttpResponse, http } from "msw";

import mockPostImageOne from "@/assets/icons/Temp-volunteer-posting.svg";
import mockPostImageThree from "@/assets/onboarding/onboarding-step2-center.svg";
import mockPostImageTwo from "@/assets/onboarding/onboarding-step1-center.svg";
import { addMockBadgeProgress, earnMockBadge } from "./badgeHandlers";
import teams from "./data/teams.json";
import regions from "./data/regions.json";
import { getMockUserById } from "./data/mockUsers";

import {
  createUnauthorizedResponse,
  getMockUserId,
} from "@/mocks/lib/mockAuth";
import { isLocalDateTimeApiValue } from "@/shared/lib/localDateTime";
import type {
  MeetingCreateRequest,
  MeetingUpdateRequest,
  MeetingMember,
  MeetingMemberRole,
  MeetingPostType,
  MyAppliedRecruit,
} from "@/features/team/types/team.types";
import type {
  MeetingPostCreateRequest,
  MeetingPostUpdateRequest,
} from "@/features/team/types/meetingPost.types";
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
const MEETING_POST_TYPES = new Set<MeetingPostType>([
  "NOTICE",
  "REVIEW",
  "RECRUIT",
  "FREE",
]);
const SORTABLE_MEETING_POST_FIELDS = ["createdAt", "id"] as const;
const SORTABLE_MEETING_POST_COMMENT_FIELDS = ["createdAt"] as const;

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
type MeetingPostCommentSortField =
  (typeof SORTABLE_MEETING_POST_COMMENT_FIELDS)[number];
type MeetingPostCommentSort = {
  field: MeetingPostCommentSortField;
  direction: "asc" | "desc";
};

export type MockMeeting = {
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
  timeRecognized?: boolean;
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

type MockMeetingPostComment = {
  commentId: number;
  meetingId: number;
  postId: number;
  authorId: number;
  authorNickname: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type MockAppliedRecruit = MyAppliedRecruit & {
  userId: number;
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

const bookmarkPaginationMeetings: MockMeeting[] = Array.from(
  { length: 21 },
  (_, index) => ({
    meetingId: index + 101,
    name: `찜한 모임 무한스크롤 테스트 ${index + 1}`,
    description:
      "찜한 모임 목록의 다음 페이지를 확인하기 위한 mock 데이터예요.",
    currentMemberCount: (index % 5) + 1,
    maxMember: 10,
    regionId: index % 2 === 0 ? 41 : 32,
    regionName: index % 2 === 0 ? "영등포구" : "마포구",
    categories: [
      [
        "ENVIRONMENT",
        "EDUCATION",
        "CULTURE",
        "COMMUNITY",
        "WELFARE",
        "OVERSEAS",
      ][index % 6],
    ],
    status: "RECRUITING",
    deadline: formatMockDateTime("2026-08-31T18:00:00", index + 1),
    activityStartAt: formatMockDateTime("2026-09-01T10:00:00", index + 1),
    activityEndAt: formatMockDateTime("2026-09-01T12:00:00", index + 1),
    hostId: index + 101,
    volunteerPostingId: null,
    participationCondition: null,
    memo: null,
  }),
);

const createdMeetings: MockMeeting[] = [];
const deletedMeetingIds = new Set<number>();
const membershipsByUserId = new Map<number, Map<number, MeetingMemberRole>>([
  [
    1,
    new Map([
      [1, "HOST"],
      [3, "MEMBER"],
    ]),
  ],
]);
const pendingJoinRequestIdByUserAndMeeting = new Map<string, number>();
let nextJoinRequestId = 100;

function getPendingJoinRequestKey(userId: number, meetingId: number) {
  return `${userId}:${meetingId}`;
}
const bookmarkedMeetingIdsByUserId = new Map<number, Set<number>>([
  [1, new Set(bookmarkPaginationMeetings.map((meeting) => meeting.meetingId))],
]);
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
const meetingImageUrlsByMeetingId = new Map<number, string[]>([
  [1, [...mockPostImageUrls]],
  [2, [mockPostImageOne]],
]);

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

export function approveMockMeetingMember(
  meetingId: number,
  userId: number,
  nickname: string,
) {
  const members = meetingMembersByMeetingId[meetingId] ?? [];
  if (!members.some((member) => member.userId === userId)) {
    members.push({ userId, nickname, role: "MEMBER", host: false });
    meetingMembersByMeetingId[meetingId] = members;
  }
}

export function removeMockMeetingMember(meetingId: number, userId: number) {
  const members = meetingMembersByMeetingId[meetingId];
  const memberIndex = members?.findIndex((member) => member.userId === userId);
  if (members && memberIndex !== undefined && memberIndex >= 0) {
    members.splice(memberIndex, 1);
  }
  membershipsByUserId.get(userId)?.delete(meetingId);
}

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
    commentCount: 2,
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
    commentCount: 0,
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
    postId: 5,
    meetingId: 1,
    type: "RECRUIT",
    title: "6월 도시락 배달 참여자 모집",
    content:
      "마포사회복지관에서 도시락 배달 봉사에 함께할 참여자를 모집합니다.",
    authorId: 1,
    authorNickname: "가더",
    imageUrls: [],
    likeCount: 3,
    commentCount: 0,
    likedUserIds: [],
    createdAt: "2026-05-15T18:10:00",
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
    commentCount: 0,
    likedUserIds: [],
    createdAt: "2026-07-24T18:10:00",
  },
];

export function upsertMockMeetingRecruitPost({
  postId,
  meetingId,
  title,
  content,
}: {
  postId: number;
  meetingId: number;
  title: string;
  content: string;
}) {
  const existing = meetingPosts.find(
    (post) => post.meetingId === meetingId && post.postId === postId,
  );
  if (existing) {
    existing.title = title;
    existing.content = content;
    return;
  }
  meetingPosts.push({
    postId,
    meetingId,
    type: "RECRUIT",
    title,
    content,
    authorId: 1,
    authorNickname: "가더",
    imageUrls: [],
    likeCount: 0,
    commentCount: 0,
    likedUserIds: [],
    createdAt: new Date().toISOString().slice(0, 19),
  });
}

const appliedRecruits: MockAppliedRecruit[] = [
  {
    userId: 1,
    postId: 5,
    meetingId: 1,
    title: "6월 도시락 배달 참여자 모집",
    place: "마포사회복지관",
    activityStartAt: "2026-05-22T10:00:00",
    activityEndAt: "2026-05-22T12:00:00",
    status: "APPLIED",
  },
];

const meetingPostComments: MockMeetingPostComment[] = [
  {
    commentId: 1,
    meetingId: 1,
    postId: 1,
    authorId: 102,
    authorNickname: "박서준",
    content: "수고 많으셨습니다!",
    createdAt: "2026-05-15T10:00:00",
    updatedAt: "2026-05-15T10:00:00",
  },
  {
    commentId: 2,
    meetingId: 1,
    postId: 1,
    authorId: 103,
    authorNickname: "최민호",
    content: "다음에도 기대돼요:)",
    createdAt: "2026-05-16T10:00:00",
    updatedAt: "2026-05-16T10:00:00",
  },
  {
    commentId: 3,
    meetingId: 1,
    postId: 3,
    authorId: 1,
    authorNickname: "가더",
    content: "준비물 확인했습니다!",
    createdAt: "2026-07-26T10:00:00",
    updatedAt: "2026-07-26T10:00:00",
  },
];
let nextMeetingPostCommentId = 4;

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

function isMeetingPostType(value: string): value is MeetingPostType {
  return MEETING_POST_TYPES.has(value as MeetingPostType);
}

function parseMeetingPostTypes(url: URL): MeetingPostType[] | null {
  const rawTypes = url.searchParams.get("types");

  if (!rawTypes || rawTypes.trim() === "") {
    return [];
  }

  return rawTypes
    .split(",")
    .map((type) => type.trim())
    .filter(Boolean)
    .reduce<MeetingPostType[] | null>((types, type) => {
      if (!types || !isMeetingPostType(type)) {
        return null;
      }

      if (!types.includes(type)) {
        types.push(type);
      }

      return types;
    }, []);
}

function parseMeetingPostCommentSorts(
  url: URL,
): MeetingPostCommentSort[] | null {
  const rawSorts = url.searchParams.getAll("sort");

  if (rawSorts.length === 0) {
    return [{ field: "createdAt", direction: "asc" }];
  }

  return rawSorts.reduce<MeetingPostCommentSort[] | null>((sorts, rawSort) => {
    if (!sorts) {
      return null;
    }

    const [field, direction = "asc"] = rawSort.split(",");

    if (
      !SORTABLE_MEETING_POST_COMMENT_FIELDS.includes(
        field as MeetingPostCommentSortField,
      ) ||
      (direction !== "asc" && direction !== "desc")
    ) {
      return null;
    }

    sorts.push({ field: field as MeetingPostCommentSortField, direction });
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

function getMeetingPostCommentSortValue(
  comment: MockMeetingPostComment,
  field: MeetingPostCommentSortField,
) {
  return comment[field];
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

function sortMeetingPostComments(
  items: MockMeetingPostComment[],
  sorts: MeetingPostCommentSort[],
) {
  return [...items].sort((left, right) => {
    for (const { field, direction } of sorts) {
      const leftValue = getMeetingPostCommentSortValue(left, field);
      const rightValue = getMeetingPostCommentSortValue(right, field);
      const comparison = String(leftValue).localeCompare(String(rightValue));

      if (comparison !== 0) {
        return direction === "asc" ? comparison : -comparison;
      }
    }

    return 0;
  });
}

function getPublicUser(userId: number, nickname: string) {
  const user = getMockUserById(userId);

  return {
    nickname: user?.userStatus === "WITHDRAWN" ? user.nickname : nickname,
    userStatus: user?.userStatus ?? "ACTIVE",
  } as const;
}

function toMeetingPostSummary(post: MockMeetingPost, viewerUserId: number) {
  const author = getPublicUser(post.authorId, post.authorNickname);

  return {
    postId: post.postId,
    type: post.type,
    title: post.title,
    content: post.content,
    authorId: post.authorId,
    authorNickname: author.nickname,
    userStatus: author.userStatus,
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

function canEditMeetingPostComment(
  comment: MockMeetingPostComment,
  viewerUserId: number,
) {
  return comment.authorId === viewerUserId;
}

function canDeleteMeetingPostComment(
  comment: MockMeetingPostComment,
  viewerUserId: number,
  team: MockMeeting,
) {
  return (
    canEditMeetingPostComment(comment, viewerUserId) ||
    team.hostId === viewerUserId
  );
}

function toMeetingPostCommentResponse(
  comment: MockMeetingPostComment,
  viewerUserId: number,
  team: MockMeeting,
) {
  const author = getPublicUser(comment.authorId, comment.authorNickname);

  return {
    commentId: comment.commentId,
    authorId: comment.authorId,
    authorNickname: author.nickname,
    userStatus: author.userStatus,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    canEdit: canEditMeetingPostComment(comment, viewerUserId),
    canDelete: canDeleteMeetingPostComment(comment, viewerUserId, team),
  };
}

function getMockMeetings() {
  return [
    ...(baseMockMeetings as MockMeeting[]),
    ...bookmarkPaginationMeetings,
    ...createdMeetings,
  ].filter((meeting) => !deletedMeetingIds.has(meeting.meetingId));
}

export function getCreatedMockMeetings(userId: number) {
  return createdMeetings.filter(
    (meeting) => getMembershipRole(userId, meeting.meetingId) !== null,
  );
}

export function getJoinedMockMeetings(userId: number) {
  const joinedMeetingIds = membershipsByUserId.get(userId)?.keys() ?? [];
  const joinedMeetingIdSet = new Set(joinedMeetingIds);

  return getMockMeetings().filter((meeting) =>
    joinedMeetingIdSet.has(meeting.meetingId),
  );
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

export function isMockMeetingMember(userId: number, meetingId: number) {
  return getMembershipRole(userId, meetingId) !== null;
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

  return members.map((member) => {
    const publicUser = getPublicUser(member.userId, member.nickname);

    return {
      ...member,
      nickname: publicUser.nickname,
      userStatus: publicUser.userStatus,
    };
  });
}

function toMeetingListItem(team: MockMeeting) {
  return {
    meetingId: team.meetingId,
    name: team.name,
    description: team.description,
    currentMemberCount: getMeetingMembers(team).length,
    maxMember: team.maxMember,
    regionId: team.regionId,
    regionName: team.regionName,
    categories: team.categories,
    status: team.status,
    deadline: team.deadline,
    activityStartAt: team.activityStartAt,
  };
}

function findMeeting(meetingId: number) {
  return getMockMeetings().find((team) => team.meetingId === meetingId);
}

function findMeetingPost(meetingId: number, postId: number) {
  return meetingPosts.find(
    (meetingPost) =>
      meetingPost.meetingId === meetingId && meetingPost.postId === postId,
  );
}

function canReadMeetingPost(
  userId: number,
  meetingId: number,
  post: MockMeetingPost,
) {
  const isJoined = getMembershipRole(userId, meetingId) !== null;

  return isJoined || post.type === "NOTICE" || post.type === "REVIEW";
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
  http.get("*/api/v1/meetings/bookmarks", ({ request }) => {
    const userId = getMockUserId(request);
    if (!userId) {
      return createUnauthorizedResponse();
    }

    const url = new URL(request.url);
    const page = getPageParam(url);
    const size = getSizeParam(url);
    const category = url.searchParams.get("category");
    const keyword = url.searchParams.get("keyword")?.trim();
    const regionId = getOptionalNumberParam(url, "regionId");
    const activityStartDate = url.searchParams.get("activityStartDate");
    const activityEndDate = url.searchParams.get("activityEndDate");
    const bookmarkedIds =
      bookmarkedMeetingIdsByUserId.get(userId) ?? new Set<number>();
    const includedRegionIds =
      regionId === undefined
        ? null
        : new Set(
            regions.data
              .filter(
                (region) =>
                  region.id === regionId || region.parentId === regionId,
              )
              .map((region) => region.id),
          );
    const items = getMockMeetings()
      .filter((meeting) => bookmarkedIds.has(meeting.meetingId))
      .filter(
        (meeting) =>
          !keyword ||
          [meeting.name, meeting.description]
            .filter((value): value is string => value !== null)
            .some((value) => value.includes(keyword)),
      )
      .filter(
        (meeting) =>
          !category ||
          meeting.categories.includes(
            category as (typeof meeting.categories)[number],
          ),
      )
      .filter(
        (meeting) =>
          includedRegionIds === null || includedRegionIds.has(meeting.regionId),
      )
      .filter(
        (meeting) =>
          (!activityStartDate && !activityEndDate) ||
          overlapsActivityPeriod(
            meeting,
            activityStartDate ?? undefined,
            activityEndDate ?? undefined,
          ),
      )
      .map(toMeetingListItem);

    return HttpResponse.json({
      success: true,
      data: {
        content: items.slice(page * size, (page + 1) * size),
        totalElements: items.length,
        totalPages: Math.ceil(items.length / size),
        page,
        size,
      },
      error: null,
    });
  }),

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
      body.maxMember < 1 ||
      body.maxMember > 30 ||
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
      timeRecognized: isPostingBased ? (body.timeRecognized ?? false) : false,
    };

    createdMeetings.push(meeting);
    addMembership(userId, meetingId, "HOST");

    earnMockBadge(userId, "TEAM_CREATED");

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
        timeRecognized: team.timeRecognized ?? false,
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
        pendingJoinRequested: userId
          ? pendingJoinRequestIdByUserAndMeeting.has(
              getPendingJoinRequestKey(userId, meetingId),
            )
          : false,
        myPendingJoinRequestId: userId
          ? (pendingJoinRequestIdByUserAndMeeting.get(
              getPendingJoinRequestKey(userId, meetingId),
            ) ?? null)
          : null,
      },
      error: null,
    });
  }),

  http.get("*/api/v1/meetings/:meetingId/my/posts", ({ params, request }) => {
    const userId = getMockUserId(request);

    if (!userId) {
      return createUnauthorizedResponse();
    }

    const meetingId = Number(params.meetingId);
    const team = findMeeting(meetingId);
    const url = new URL(request.url);
    const page = getPageParam(url);
    const size = getMeetingPostSizeParam(url);
    const sorts = parseMeetingPostSorts(url);

    if (!team) {
      return createMeetingNotFoundResponse();
    }

    if (getMembershipRole(userId, meetingId) === null) {
      return createMeetingErrorResponse(
        "MEETING_MEMBER_REQUIRED",
        "모임 가입자만 이용할 수 있습니다.",
        403,
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

    const posts = sortMeetingPosts(
      meetingPosts.filter(
        (post) => post.meetingId === meetingId && post.authorId === userId,
      ),
      sorts,
    );
    const content = posts
      .slice(page * size, (page + 1) * size)
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
    "*/api/v1/meetings/:meetingId/my/commented-posts",
    ({ params, request }) => {
      const userId = getMockUserId(request);

      if (!userId) {
        return createUnauthorizedResponse();
      }

      const meetingId = Number(params.meetingId);
      const team = findMeeting(meetingId);
      const url = new URL(request.url);
      const page = getPageParam(url);
      const size = getMeetingPostSizeParam(url);
      const sorts = parseMeetingPostSorts(url);

      if (!team) {
        return createMeetingNotFoundResponse();
      }

      if (getMembershipRole(userId, meetingId) === null) {
        return createMeetingErrorResponse(
          "MEETING_MEMBER_REQUIRED",
          "모임 가입자만 이용할 수 있습니다.",
          403,
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

      const commentedPostIds = new Set(
        meetingPostComments
          .filter(
            (comment) =>
              comment.meetingId === meetingId && comment.authorId === userId,
          )
          .map((comment) => comment.postId),
      );
      const posts = sortMeetingPosts(
        meetingPosts.filter(
          (post) =>
            post.meetingId === meetingId && commentedPostIds.has(post.postId),
        ),
        sorts,
      );
      const content = posts
        .slice(page * size, (page + 1) * size)
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
    },
  ),

  http.get(
    "*/api/v1/meetings/:meetingId/my/activity-summary",
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

      if (getMembershipRole(userId, meetingId) === null) {
        return createMeetingErrorResponse(
          "MEETING_MEMBER_REQUIRED",
          "모임 가입자만 이용할 수 있습니다.",
          403,
        );
      }

      const commentedPostIds = new Set(
        meetingPostComments
          .filter(
            (comment) =>
              comment.meetingId === meetingId && comment.authorId === userId,
          )
          .map((comment) => comment.postId),
      );

      return HttpResponse.json({
        success: true,
        data: {
          writtenPostCount: meetingPosts.filter(
            (post) => post.meetingId === meetingId && post.authorId === userId,
          ).length,
          commentedPostCount: commentedPostIds.size,
          appliedRecruitCount: appliedRecruits.filter(
            (recruit) =>
              recruit.meetingId === meetingId && recruit.userId === userId,
          ).length,
        },
        error: null,
      });
    },
  ),

  http.get(
    "*/api/v1/meetings/:meetingId/my/applied-recruits",
    ({ params, request }) => {
      const userId = getMockUserId(request);

      if (!userId) {
        return createUnauthorizedResponse();
      }

      const meetingId = Number(params.meetingId);
      const team = findMeeting(meetingId);
      const url = new URL(request.url);
      const page = getPageParam(url);
      const size = getMeetingPostSizeParam(url);

      if (!team) {
        return createMeetingNotFoundResponse();
      }

      if (getMembershipRole(userId, meetingId) === null) {
        return createMeetingErrorResponse(
          "MEETING_MEMBER_REQUIRED",
          "모임 가입자만 이용할 수 있습니다.",
          403,
        );
      }

      const items = appliedRecruits
        .filter(
          (recruit) =>
            recruit.meetingId === meetingId && recruit.userId === userId,
        )
        .sort((left, right) => {
          const dateComparison = right.activityStartAt.localeCompare(
            left.activityStartAt,
          );

          return dateComparison === 0
            ? right.postId - left.postId
            : dateComparison;
        });
      const content = items
        .slice(page * size, (page + 1) * size)
        .map((recruit) => ({
          postId: recruit.postId,
          meetingId: recruit.meetingId,
          title: recruit.title,
          place: recruit.place,
          activityStartAt: recruit.activityStartAt,
          activityEndAt: recruit.activityEndAt,
          status: recruit.status,
        }));

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
    },
  ),

  http.get("*/api/v1/meetings/:meetingId/posts", ({ params, request }) => {
    const userId = getMockUserId(request);

    if (!userId) {
      return createUnauthorizedResponse();
    }

    const meetingId = Number(params.meetingId);
    const team = findMeeting(meetingId);
    const url = new URL(request.url);
    const postTypes = parseMeetingPostTypes(url);
    const page = getPageParam(url);
    const size = getMeetingPostSizeParam(url);
    const sorts = parseMeetingPostSorts(url);

    if (!team) {
      return createMeetingNotFoundResponse();
    }

    if (!postTypes) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid post types.",
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
    const requestedPostTypes = new Set(postTypes);
    const posts = sortMeetingPosts(
      meetingPosts
        .filter((post) => post.meetingId === meetingId)
        .filter(
          (post) =>
            isJoined || post.type === "NOTICE" || post.type === "REVIEW",
        )
        .filter(
          (post) =>
            requestedPostTypes.size === 0 || requestedPostTypes.has(post.type),
        ),
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

  http.post(
    "*/api/v1/meetings/:meetingId/posts",
    async ({ params, request }) => {
      const userId = getMockUserId(request);
      if (!userId) {
        return createUnauthorizedResponse();
      }
      const meetingId = Number(params.meetingId);
      const team = findMeeting(meetingId);
      if (!team) {
        return createMeetingNotFoundResponse();
      }
      const role = getMembershipRole(userId, meetingId);
      if (!role) {
        return createMeetingErrorResponse(
          "MEETING_MEMBER_REQUIRED",
          "승인된 모임원만 게시글을 작성할 수 있습니다.",
          403,
        );
      }
      const body = (await request.json()) as MeetingPostCreateRequest;
      if (body.type === "NOTICE" && role !== "HOST") {
        return createMeetingErrorResponse(
          "MEETING_HOST_REQUIRED",
          "팀장만 공지를 작성할 수 있습니다.",
          403,
        );
      }
      if (
        !body.title.trim() ||
        body.title.trim().length > 15 ||
        !body.content.trim() ||
        body.content.trim().length > 1000 ||
        (body.imageObjectKeys?.length ?? 0) > 3
      ) {
        return createMeetingErrorResponse(
          "VALIDATION_ERROR",
          "게시글 작성 요청이 올바르지 않습니다.",
          400,
        );
      }
      const user = getMockUserById(userId);
      const now = new Date().toISOString().slice(0, 19);
      const post: MockMeetingPost = {
        postId: Math.max(...meetingPosts.map((item) => item.postId), 0) + 1,
        meetingId,
        type: body.type,
        title: body.title.trim(),
        content: body.content.trim(),
        authorId: userId,
        authorNickname: user?.nickname ?? "나",
        imageUrls: (body.imageObjectKeys ?? []).map(
          (objectKey) => `https://mock-s3.gather.local/${objectKey}`,
        ),
        likeCount: 0,
        commentCount: 0,
        likedUserIds: [],
        createdAt: now,
      };
      meetingPosts.push(post);
      return HttpResponse.json(
        {
          success: true,
          data: toMeetingPostDetail(post, userId, team),
          error: null,
        },
        { status: 201 },
      );
    },
  ),

  http.post(
    "*/api/v1/meetings/:meetingId/posts/:postId/likes",
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

      const post = findMeetingPost(meetingId, postId);

      if (!post) {
        return createPostNotFoundResponse();
      }

      if (getMembershipRole(userId, meetingId) === null) {
        return createMeetingErrorResponse(
          "MEETING_MEMBER_REQUIRED",
          "모임 가입자만 이용할 수 있습니다.",
          403,
        );
      }

      const likedIndex = post.likedUserIds.indexOf(userId);
      const liked = likedIndex === -1;

      if (liked) {
        post.likedUserIds.push(userId);
        post.likeCount += 1;
      } else {
        post.likedUserIds.splice(likedIndex, 1);
        post.likeCount = Math.max(0, post.likeCount - 1);
      }

      return HttpResponse.json({
        success: true,
        data: { liked, likeCount: post.likeCount },
        error: null,
      });
    },
  ),

  http.get(
    "*/api/v1/meetings/:meetingId/posts/:postId/comments",
    ({ params, request }) => {
      const userId = getMockUserId(request);

      if (!userId) {
        return createUnauthorizedResponse();
      }

      const meetingId = Number(params.meetingId);
      const postId = Number(params.postId);
      const team = findMeeting(meetingId);
      const url = new URL(request.url);
      const page = getPageParam(url);
      const size = getMeetingPostSizeParam(url);
      const sorts = parseMeetingPostCommentSorts(url);

      if (!team) {
        return createMeetingNotFoundResponse();
      }

      const post = findMeetingPost(meetingId, postId);

      if (!post) {
        return createPostNotFoundResponse();
      }

      if (!canReadMeetingPost(userId, meetingId, post)) {
        return createMeetingErrorResponse(
          "POST_ACCESS_DENIED",
          "접근할 수 없는 게시글입니다.",
          403,
        );
      }

      if (!sorts) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid comment sort.",
            },
          },
          { status: 400 },
        );
      }

      const comments = sortMeetingPostComments(
        meetingPostComments.filter(
          (comment) =>
            comment.meetingId === meetingId && comment.postId === postId,
        ),
        sorts,
      );
      const startIndex = page * size;
      const content = comments
        .slice(startIndex, startIndex + size)
        .map((comment) => toMeetingPostCommentResponse(comment, userId, team));

      return HttpResponse.json({
        success: true,
        data: {
          content,
          totalElements: comments.length,
          totalPages: Math.ceil(comments.length / size),
          page,
          size,
        },
        error: null,
      });
    },
  ),

  http.post(
    "*/api/v1/meetings/:meetingId/posts/:postId/comments",
    async ({ params, request }) => {
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

      const post = findMeetingPost(meetingId, postId);

      if (!post) {
        return createPostNotFoundResponse();
      }

      if (getMembershipRole(userId, meetingId) === null) {
        return createMeetingErrorResponse(
          "MEETING_MEMBER_REQUIRED",
          "모임 가입자만 댓글을 작성할 수 있습니다.",
          403,
        );
      }

      const body = (await request.json()) as { content?: unknown };
      const content =
        typeof body.content === "string" ? body.content.trim() : "";

      if (!content || content.length > 500) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid comment content.",
            },
          },
          { status: 400 },
        );
      }

      const now = new Date().toISOString().slice(0, 19);
      const user = getMockUserById(userId);
      const comment: MockMeetingPostComment = {
        commentId: nextMeetingPostCommentId++,
        meetingId,
        postId,
        authorId: userId,
        authorNickname: user?.nickname ?? "나",
        content,
        createdAt: now,
        updatedAt: now,
      };

      meetingPostComments.push(comment);
      post.commentCount += 1;
      addMockBadgeProgress(userId, "COMMENT_10");

      return HttpResponse.json(
        {
          success: true,
          data: toMeetingPostCommentResponse(comment, userId, team),
          error: null,
        },
        { status: 201 },
      );
    },
  ),

  http.patch(
    "*/api/v1/meetings/:meetingId/posts/:postId/comments/:commentId",
    async ({ params, request }) => {
      const userId = getMockUserId(request);

      if (!userId) {
        return createUnauthorizedResponse();
      }

      const meetingId = Number(params.meetingId);
      const postId = Number(params.postId);
      const commentId = Number(params.commentId);
      const team = findMeeting(meetingId);

      if (!team) {
        return createMeetingNotFoundResponse();
      }

      const post = findMeetingPost(meetingId, postId);

      if (!post) {
        return createPostNotFoundResponse();
      }

      const comment = meetingPostComments.find(
        (meetingPostComment) =>
          meetingPostComment.meetingId === meetingId &&
          meetingPostComment.postId === postId &&
          meetingPostComment.commentId === commentId,
      );

      if (!comment) {
        return createMeetingErrorResponse(
          "COMMENT_NOT_FOUND",
          "댓글을 찾을 수 없습니다.",
          404,
        );
      }

      if (!canEditMeetingPostComment(comment, userId)) {
        return createMeetingErrorResponse(
          "COMMENT_FORBIDDEN",
          "댓글을 수정할 권한이 없습니다.",
          403,
        );
      }

      const body = (await request.json()) as { content?: unknown };
      const content =
        typeof body.content === "string" ? body.content.trim() : "";

      if (!content || content.length > 500) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid comment content.",
            },
          },
          { status: 400 },
        );
      }

      comment.content = content;
      comment.updatedAt = new Date().toISOString().slice(0, 19);

      return HttpResponse.json({
        success: true,
        data: toMeetingPostCommentResponse(comment, userId, team),
        error: null,
      });
    },
  ),

  http.delete(
    "*/api/v1/meetings/:meetingId/posts/:postId/comments/:commentId",
    ({ params, request }) => {
      const userId = getMockUserId(request);

      if (!userId) {
        return createUnauthorizedResponse();
      }

      const meetingId = Number(params.meetingId);
      const postId = Number(params.postId);
      const commentId = Number(params.commentId);
      const team = findMeeting(meetingId);

      if (!team) {
        return createMeetingNotFoundResponse();
      }

      const post = findMeetingPost(meetingId, postId);

      if (!post) {
        return createPostNotFoundResponse();
      }

      const commentIndex = meetingPostComments.findIndex(
        (comment) =>
          comment.meetingId === meetingId &&
          comment.postId === postId &&
          comment.commentId === commentId,
      );

      if (commentIndex === -1) {
        return createMeetingErrorResponse(
          "COMMENT_NOT_FOUND",
          "댓글을 찾을 수 없습니다.",
          404,
        );
      }

      const comment = meetingPostComments[commentIndex];

      if (!canDeleteMeetingPostComment(comment, userId, team)) {
        return createMeetingErrorResponse(
          "COMMENT_FORBIDDEN",
          "댓글을 삭제할 권한이 없습니다.",
          403,
        );
      }

      meetingPostComments.splice(commentIndex, 1);
      post.commentCount = Math.max(0, post.commentCount - 1);

      return HttpResponse.json({
        success: true,
        data: null,
        error: null,
      });
    },
  ),

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

  http.patch(
    "*/api/v1/meetings/:meetingId/posts/:postId",
    async ({ params, request }) => {
      const userId = getMockUserId(request);
      if (!userId) {
        return createUnauthorizedResponse();
      }
      const meetingId = Number(params.meetingId);
      const postId = Number(params.postId);
      const team = findMeeting(meetingId);
      const post = findMeetingPost(meetingId, postId);
      if (!team) {
        return createMeetingNotFoundResponse();
      }
      if (!post) {
        return createPostNotFoundResponse();
      }
      if (post.authorId !== userId) {
        return createMeetingErrorResponse(
          "POST_FORBIDDEN",
          "게시글을 수정할 권한이 없습니다.",
          403,
        );
      }
      const body = (await request.json()) as MeetingPostUpdateRequest;
      post.title = body.title.trim();
      post.content = body.content.trim();
      if (body.imageObjectKeys !== null && body.imageObjectKeys !== undefined) {
        post.imageUrls = body.imageObjectKeys.map(
          (objectKey) => `https://mock-s3.gather.local/${objectKey}`,
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

    const requestKey = getPendingJoinRequestKey(userId, meetingId);
    if (pendingJoinRequestIdByUserAndMeeting.has(requestKey)) {
      return createMeetingErrorResponse(
        "MEETING_JOIN_REQUEST_ALREADY_PENDING",
        "이미 가입 신청을 보냈습니다.",
        409,
      );
    }
    pendingJoinRequestIdByUserAndMeeting.set(requestKey, nextJoinRequestId++);

    return HttpResponse.json({
      success: true,
      data: {
        joinRequestId: pendingJoinRequestIdByUserAndMeeting.get(requestKey),
        meetingId,
        status: "PENDING",
      },
      error: null,
    });
  }),

  http.delete("*/api/v1/meetings/:meetingId/join", ({ params, request }) => {
    const userId = getMockUserId(request);
    if (!userId) {
      return createUnauthorizedResponse();
    }
    const requestKey = getPendingJoinRequestKey(
      userId,
      Number(params.meetingId),
    );
    if (!pendingJoinRequestIdByUserAndMeeting.delete(requestKey)) {
      return createMeetingErrorResponse(
        "MEETING_JOIN_REQUEST_NOT_FOUND",
        "취소할 가입 신청이 없습니다.",
        404,
      );
    }
    return HttpResponse.json({ success: true, data: null, error: null });
  }),

  http.patch("*/api/v1/meetings/:meetingId", async ({ params, request }) => {
    const userId = getMockUserId(request);
    if (!userId) {
      return createUnauthorizedResponse();
    }
    const meetingId = Number(params.meetingId);
    const team = findMeeting(meetingId);
    if (!team) {
      return createMeetingNotFoundResponse();
    }
    if (team.hostId !== userId) {
      return createMeetingErrorResponse(
        "MEETING_HOST_REQUIRED",
        "팀장만 모임 정보를 수정할 수 있습니다.",
        403,
      );
    }
    const body = (await request.json()) as MeetingUpdateRequest;
    if (
      body.maxMember > 30 ||
      body.maxMember < getMeetingMembers(team).length ||
      !isLocalDateTimeApiValue(body.deadline)
    ) {
      return createMeetingErrorResponse(
        "VALIDATION_ERROR",
        "모임 수정 요청이 올바르지 않습니다.",
        400,
      );
    }
    team.name = body.name;
    team.description = body.description;
    team.maxMember = body.maxMember;
    team.deadline = body.deadline;
    team.participationCondition = body.participationCondition;
    if (team.volunteerPostingId === null) {
      if (body.regionId !== null) team.regionId = body.regionId;
      if (body.categories !== null) team.categories = body.categories;
      team.timeRecognized = false;
    } else {
      team.timeRecognized = body.timeRecognized;
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
        bookmarked: false,
        timeRecognized: team.timeRecognized ?? false,
      },
      error: null,
    });
  }),

  http.delete("*/api/v1/meetings/:meetingId", ({ params, request }) => {
    const userId = getMockUserId(request);
    if (!userId) {
      return createUnauthorizedResponse();
    }
    const meetingId = Number(params.meetingId);
    const team = findMeeting(meetingId);
    if (!team) {
      return createMeetingNotFoundResponse();
    }
    if (team.hostId !== userId) {
      return createMeetingErrorResponse(
        "MEETING_HOST_REQUIRED",
        "팀장만 모임을 해산할 수 있습니다.",
        403,
      );
    }
    deletedMeetingIds.add(meetingId);
    return HttpResponse.json({ success: true, data: null, error: null });
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
        timeRecognized: team.timeRecognized ?? false,
      },
      error: null,
    });
  }),
];
