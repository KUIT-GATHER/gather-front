import { fetchClient } from "@/shared/api/fetchClient";

import type {
  MeetingDetail,
  MeetingListParams,
  MeetingPage,
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

export function getMeetings(params?: MeetingListParams) {
  return fetchClient<MeetingPage>(buildMeetingsEndpoint(params), publicOptions);
}

export function getMeeting(meetingId: number) {
  return fetchClient<MeetingDetail>(
    `${MEETING_ENDPOINT}/${meetingId}`,
    publicOptions,
  );
}
