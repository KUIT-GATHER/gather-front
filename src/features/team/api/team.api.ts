import type { PostingCategory } from "@/features/category/types/postingCategory.types";
import { fetchClient } from "@/shared/api/fetchClient";

import type {
  MeetingBookmarkResponse,
  MeetingCreateRequest,
  MeetingDetail,
  MeetingHome,
  MeetingJoinRequest,
  MeetingListItem,
  MeetingListParams,
  MeetingPage,
  MeetingPost,
  MeetingPostComment,
  MeetingPostCommentCreateRequest,
  MeetingPostCommentListParams,
  MeetingPostCommentPage,
  MeetingPostCommentUpdateRequest,
  MeetingPostCreateRequest,
  MeetingPostLikeResponse,
  MeetingPostListParams,
  MeetingPostPage,
  MeetingPostUpdateRequest,
  MyMeetingListItem,
  MeetingRecruitDetail,
} from "@/features/team/types/team.types";

const MEETING_ENDPOINT = "/api/v1/meetings";
const DEFAULT_MEETING_POST_SORT = ["createdAt,desc", "id,desc"] as const;
const DEFAULT_MEETING_POST_COMMENT_SORT = ["createdAt,asc"] as const;
const publicOptions = {
  skipAuth: true,
  withCredentials: false,
} as const;

type MeetingCategoryResponse = {
  category?: PostingCategory;
  categories?: PostingCategory[];
};

type MeetingListItemResponse = Omit<MeetingListItem, "categories"> &
  MeetingCategoryResponse;
type MeetingDetailResponse = Omit<MeetingDetail, "categories"> &
  MeetingCategoryResponse;

export function normalizeMeetingCategories<T extends MeetingCategoryResponse>(
  meeting: T,
) {
  return {
    ...meeting,
    categories:
      meeting.categories ?? (meeting.category ? [meeting.category] : []),
  };
}

function setQueryParam(
  searchParams: URLSearchParams,
  key: string,
  value: string | number | undefined,
) {
  if (value === undefined) {
    return;
  }

  if (typeof value === "number" && !Number.isFinite(value)) {
    return;
  }

  const normalizedValue =
    typeof value === "string" ? value.trim() : String(value);

  if (normalizedValue) {
    searchParams.set(key, normalizedValue);
  }
}

function appendQueryParam(
  searchParams: URLSearchParams,
  key: string,
  value: string,
) {
  const normalizedValue = value.trim();

  if (normalizedValue) {
    searchParams.append(key, normalizedValue);
  }
}

function buildMeetingsEndpoint(params: MeetingListParams = {}) {
  const searchParams = new URLSearchParams();
  const page = params.page ?? 0;
  const size = params.size ?? 10;

  setQueryParam(searchParams, "page", page);
  setQueryParam(searchParams, "size", size);

  params.sort?.forEach((sort) => {
    appendQueryParam(searchParams, "sort", sort);
  });

  setQueryParam(searchParams, "keyword", params.keyword);
  setQueryParam(searchParams, "regionId", params.regionId);
  setQueryParam(searchParams, "category", params.category);
  setQueryParam(searchParams, "status", params.status);
  setQueryParam(searchParams, "activityStartDate", params.activityStartDate);
  setQueryParam(searchParams, "activityEndDate", params.activityEndDate);
  setQueryParam(
    searchParams,
    "postingBasedFirst",
    params.postingBasedFirst ? "true" : undefined,
  );

  const query = searchParams.toString();

  return query ? `${MEETING_ENDPOINT}?${query}` : MEETING_ENDPOINT;
}

function buildMeetingPostsEndpoint(
  meetingId: number,
  params: MeetingPostListParams = {},
) {
  const searchParams = new URLSearchParams();
  const page = params.page ?? 0;
  const size = params.size ?? 20;
  const sorts =
    params.sort && params.sort.length > 0
      ? params.sort
      : DEFAULT_MEETING_POST_SORT;

  setQueryParam(searchParams, "types", params.types?.join(","));
  setQueryParam(searchParams, "page", page);
  setQueryParam(searchParams, "size", size);

  sorts.forEach((sort) => {
    appendQueryParam(searchParams, "sort", sort);
  });

  const query = searchParams.toString();
  const endpoint = `${MEETING_ENDPOINT}/${meetingId}/posts`;

  return query ? `${endpoint}?${query}` : endpoint;
}

function buildMeetingPostEndpoint(meetingId: number, postId: number) {
  return `${MEETING_ENDPOINT}/${meetingId}/posts/${postId}`;
}

function buildMeetingRecruitEndpoint(meetingId: number, postId: number) {
  return `${buildMeetingPostEndpoint(meetingId, postId)}/recruit`;
}

function buildMeetingPostCommentsEndpoint(
  meetingId: number,
  postId: number,
  params: MeetingPostCommentListParams = {},
) {
  const searchParams = new URLSearchParams();
  const page = params.page ?? 0;
  const size = params.size ?? 20;
  const sorts =
    params.sort && params.sort.length > 0
      ? params.sort
      : DEFAULT_MEETING_POST_COMMENT_SORT;

  setQueryParam(searchParams, "page", page);
  setQueryParam(searchParams, "size", size);

  sorts.forEach((sort) => {
    appendQueryParam(searchParams, "sort", sort);
  });

  const query = searchParams.toString();
  const endpoint = `${buildMeetingPostEndpoint(meetingId, postId)}/comments`;

  return query ? `${endpoint}?${query}` : endpoint;
}

function buildMeetingPostCommentEndpoint(
  meetingId: number,
  postId: number,
  commentId: number,
) {
  return `${buildMeetingPostEndpoint(meetingId, postId)}/comments/${commentId}`;
}

function buildMeetingPostLikesEndpoint(meetingId: number, postId: number) {
  return `${buildMeetingPostEndpoint(meetingId, postId)}/likes`;
}

export async function getMeetings(params?: MeetingListParams) {
  const page = await fetchClient<
    Omit<MeetingPage, "content"> & { content: MeetingListItemResponse[] }
  >(buildMeetingsEndpoint(params), publicOptions);

  return {
    ...page,
    content: page.content.map(normalizeMeetingCategories),
  };
}

export function getRecommendedMeetings() {
  return fetchClient<MeetingListItem[]>(`${MEETING_ENDPOINT}/recommended`);
}

export function getMeetingRecommendedKeywords() {
  return fetchClient<string[]>(
    `${MEETING_ENDPOINT}/keywords/recommended`,
    publicOptions,
  );
}

export async function getMyMeetings() {
  const meetings = await fetchClient<
    (Omit<MyMeetingListItem, "categories"> & MeetingCategoryResponse)[]
  >(`${MEETING_ENDPOINT}/my`);

  return meetings.map(normalizeMeetingCategories);
}

export async function createMeeting(payload: MeetingCreateRequest) {
  const meeting = await fetchClient<MeetingListItemResponse>(MEETING_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return normalizeMeetingCategories(meeting);
}

export async function getMeeting(meetingId: number) {
  const meeting = await fetchClient<MeetingDetailResponse>(
    `${MEETING_ENDPOINT}/${meetingId}`,
  );

  return normalizeMeetingCategories(meeting);
}

export function getMeetingHome(meetingId: number) {
  return fetchClient<MeetingHome>(`${MEETING_ENDPOINT}/${meetingId}/home`);
}

export function getMeetingJoinRequests(meetingId: number) {
  return fetchClient<MeetingJoinRequest[]>(
    `${MEETING_ENDPOINT}/${meetingId}/join-requests`,
  );
}

export function approveMeetingJoinRequest(
  meetingId: number,
  joinRequestId: number,
) {
  return fetchClient<MeetingJoinRequest>(
    `${MEETING_ENDPOINT}/${meetingId}/join-requests/${joinRequestId}/approve`,
    {
      method: "PATCH",
    },
  );
}

export function rejectMeetingJoinRequest(
  meetingId: number,
  joinRequestId: number,
) {
  return fetchClient<MeetingJoinRequest>(
    `${MEETING_ENDPOINT}/${meetingId}/join-requests/${joinRequestId}/reject`,
    {
      method: "PATCH",
    },
  );
}

export function getMeetingPosts(
  meetingId: number,
  params?: MeetingPostListParams,
) {
  return fetchClient<MeetingPostPage>(
    buildMeetingPostsEndpoint(meetingId, params),
  );
}

export function getMeetingPost(meetingId: number, postId: number) {
  return fetchClient<MeetingPost>(buildMeetingPostEndpoint(meetingId, postId));
}

export function getMeetingRecruit(meetingId: number, postId: number) {
  return fetchClient<MeetingRecruitDetail>(
    buildMeetingRecruitEndpoint(meetingId, postId),
  );
}

export async function getMeetingRecruitActivities(meetingId: number) {
  const recruitPostPage = await getMeetingPosts(meetingId, {
    types: ["RECRUIT"],
    page: 0,
    size: 100,
  });

  return Promise.all(
    recruitPostPage.content.map((post) =>
      getMeetingRecruit(meetingId, post.postId),
    ),
  );
}

export function toggleMeetingPostLike(meetingId: number, postId: number) {
  return fetchClient<MeetingPostLikeResponse>(
    buildMeetingPostLikesEndpoint(meetingId, postId),
    { method: "POST" },
  );
}

export function getMeetingPostComments(
  meetingId: number,
  postId: number,
  params?: MeetingPostCommentListParams,
) {
  return fetchClient<MeetingPostCommentPage>(
    buildMeetingPostCommentsEndpoint(meetingId, postId, params),
  );
}

export function createMeetingPostComment(
  meetingId: number,
  postId: number,
  payload: MeetingPostCommentCreateRequest,
) {
  return fetchClient<MeetingPostComment>(
    buildMeetingPostCommentsEndpoint(meetingId, postId),
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function updateMeetingPostComment(
  meetingId: number,
  postId: number,
  commentId: number,
  payload: MeetingPostCommentUpdateRequest,
) {
  return fetchClient<MeetingPostComment>(
    buildMeetingPostCommentEndpoint(meetingId, postId, commentId),
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export function deleteMeetingPostComment(
  meetingId: number,
  postId: number,
  commentId: number,
) {
  return fetchClient<null>(
    buildMeetingPostCommentEndpoint(meetingId, postId, commentId),
    { method: "DELETE" },
  );
}

export function createMeetingPost(
  meetingId: number,
  payload: MeetingPostCreateRequest,
) {
  return fetchClient<MeetingPost>(buildMeetingPostsEndpoint(meetingId), {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateMeetingPost(
  meetingId: number,
  postId: number,
  payload: MeetingPostUpdateRequest,
) {
  return fetchClient<MeetingPost>(buildMeetingPostEndpoint(meetingId, postId), {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteMeetingPost(meetingId: number, postId: number) {
  return fetchClient<null>(buildMeetingPostEndpoint(meetingId, postId), {
    method: "DELETE",
  });
}

export async function joinMeeting(meetingId: number) {
  const meeting = await fetchClient<MeetingListItemResponse>(
    `${MEETING_ENDPOINT}/${meetingId}/join`,
    { method: "POST" },
  );

  return normalizeMeetingCategories(meeting);
}

export function addMeetingBookmark(meetingId: number) {
  return fetchClient<MeetingBookmarkResponse>(
    `${MEETING_ENDPOINT}/${meetingId}/bookmark`,
    {
      method: "POST",
    },
  );
}

export function removeMeetingBookmark(meetingId: number) {
  return fetchClient<MeetingBookmarkResponse>(
    `${MEETING_ENDPOINT}/${meetingId}/bookmark`,
    {
      method: "DELETE",
    },
  );
}
