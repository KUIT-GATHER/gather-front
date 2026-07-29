import type { PostingCategory } from "@/features/category/types/postingCategory.types";
import { fetchClient } from "@/shared/api/fetchClient";

import type {
  MeetingBookmarkResponse,
  MeetingCreateRequest,
  MeetingDetail,
  MeetingHome,
  MeetingListItem,
  MeetingListParams,
  MeetingPage,
  MeetingPostListParams,
  MeetingPostSummary,
  MyMeetingListItem,
} from "@/features/team/types/team.types";

const MEETING_ENDPOINT = "/api/v1/meetings";
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

  setQueryParam(searchParams, "type", params.type);

  const query = searchParams.toString();
  const endpoint = `${MEETING_ENDPOINT}/${meetingId}/posts`;

  return query ? `${endpoint}?${query}` : endpoint;
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

export function getMeetingPosts(
  meetingId: number,
  params?: MeetingPostListParams,
) {
  return fetchClient<MeetingPostSummary[]>(
    buildMeetingPostsEndpoint(meetingId, params),
  );
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
