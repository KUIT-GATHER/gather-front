import { fetchClient } from "@/shared/api/fetchClient";

import type {
  MeetingBookmarkResponse,
  MeetingDetail,
  MeetingHome,
  MeetingListItem,
  MeetingListParams,
  MeetingPage,
  MeetingPostListParams,
  MeetingPostSummary,
} from "@/features/team/types/team.types";

const MEETING_ENDPOINT = "/api/v1/meetings";
const publicOptions = {
  skipAuth: true,
  withCredentials: false,
} as const;

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

export function getMeetings(params?: MeetingListParams) {
  return fetchClient<MeetingPage>(buildMeetingsEndpoint(params), publicOptions);
}

export function getMeeting(meetingId: number) {
  return fetchClient<MeetingDetail>(`${MEETING_ENDPOINT}/${meetingId}`);
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

export function joinMeeting(meetingId: number) {
  return fetchClient<MeetingListItem>(`${MEETING_ENDPOINT}/${meetingId}/join`, {
    method: "POST",
  });
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
