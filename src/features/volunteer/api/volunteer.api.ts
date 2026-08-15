import { fetchClient } from "@/shared/api/fetchClient";

import type {
  VolunteerPosting,
  VolunteerPostingBookmarkResponse,
  VolunteerPostingListItem,
  VolunteerPostingListParams,
  VolunteerPostingMeetingListParams,
  VolunteerPostingMeetingPage,
  VolunteerPostingPage,
  VolunteerPostingParticipationResponse,
  VolunteerPostingParticipationApplyRequest,
  PostingListPage,
} from "@/features/volunteer/types/volunteer.types";

const publicOptions = {
  skipAuth: true,
  withCredentials: false,
} as const;

const POSTING_ENDPOINT = "/api/v1/postings";

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

function buildPostingListQuery(params: VolunteerPostingListParams = {}) {
  if (params.regionId !== undefined && params.regionGroupId !== undefined) {
    throw new Error("regionId and regionGroupId cannot be used together.");
  }

  const searchParams = new URLSearchParams();
  const page = params.page ?? 0;
  const size = params.size ?? 20;

  setQueryParam(searchParams, "page", page);
  setQueryParam(searchParams, "size", size);

  params.sort?.forEach((sort) => {
    appendQueryParam(searchParams, "sort", sort);
  });

  setQueryParam(searchParams, "regionId", params.regionId);
  setQueryParam(searchParams, "regionGroupId", params.regionGroupId);
  setQueryParam(searchParams, "status", params.status);
  setQueryParam(searchParams, "noticeStartDate", params.noticeStartDate);
  setQueryParam(searchParams, "noticeEndDate", params.noticeEndDate);
  setQueryParam(searchParams, "keyword", params.keyword);
  setQueryParam(searchParams, "category", params.category);

  return searchParams.toString();
}

function buildPostingListEndpoint(params?: VolunteerPostingListParams) {
  const query = buildPostingListQuery(params);

  return query ? `${POSTING_ENDPOINT}?${query}` : POSTING_ENDPOINT;
}

function buildPostingEndpoint(postingId: number) {
  return `${POSTING_ENDPOINT}/${postingId}`;
}

function buildPostingMeetingsEndpoint(
  postingId: number,
  params: VolunteerPostingMeetingListParams = {},
) {
  const searchParams = new URLSearchParams();
  const page = params.page ?? 0;
  const size = params.size ?? 10;

  setQueryParam(searchParams, "page", page);
  setQueryParam(searchParams, "size", size);

  params.sort?.forEach((sort) => {
    appendQueryParam(searchParams, "sort", sort);
  });

  const query = searchParams.toString();
  const endpoint = `${POSTING_ENDPOINT}/${postingId}/meetings`;

  return query ? `${endpoint}?${query}` : endpoint;
}

export function getVolunteerPostings(params?: VolunteerPostingListParams) {
  return fetchClient<PostingListPage>(
    buildPostingListEndpoint(params),
    publicOptions,
  );
}

export function getBookmarkedVolunteerPostings(
  params: VolunteerPostingListParams = {},
) {
  const query = buildPostingListQuery(params);

  return fetchClient<VolunteerPostingPage>(
    `${POSTING_ENDPOINT}/bookmarks?${query}`,
  );
}

export function getRecommendedVolunteerPostings() {
  return fetchClient<VolunteerPostingListItem[]>(
    `${POSTING_ENDPOINT}/recommended`,
  );
}

export function getVolunteerPosting(postingId: number) {
  return fetchClient<VolunteerPosting>(buildPostingEndpoint(postingId));
}

export function getVolunteerPostingMeetings(
  postingId: number,
  params?: VolunteerPostingMeetingListParams,
) {
  return fetchClient<VolunteerPostingMeetingPage>(
    buildPostingMeetingsEndpoint(postingId, params),
  );
}

export function getVolunteerPostingRecommendedKeywords() {
  return fetchClient<string[]>(
    `${POSTING_ENDPOINT}/keywords/recommended`,
    publicOptions,
  );
}

export function addVolunteerPostingBookmark(postingId: number) {
  return fetchClient<VolunteerPostingBookmarkResponse>(
    `${POSTING_ENDPOINT}/${postingId}/bookmark`,
    {
      method: "POST",
    },
  );
}

export function removeVolunteerPostingBookmark(postingId: number) {
  return fetchClient<VolunteerPostingBookmarkResponse>(
    `${POSTING_ENDPOINT}/${postingId}/bookmark`,
    {
      method: "DELETE",
    },
  );
}

export function applyVolunteerPostingParticipation(
  postingId: number,
  request: VolunteerPostingParticipationApplyRequest,
) {
  return fetchClient<VolunteerPostingParticipationResponse>(
    `${POSTING_ENDPOINT}/${postingId}/participations`,
    {
      method: "POST",
      body: JSON.stringify(request),
    },
  );
}

export function cancelVolunteerPostingParticipation(postingId: number) {
  return fetchClient<null>(`${POSTING_ENDPOINT}/${postingId}/participations`, {
    method: "DELETE",
  });
}

export function completeVolunteerPostingParticipation(postingId: number) {
  return fetchClient<null>(
    `${POSTING_ENDPOINT}/${postingId}/participations/complete`,
    {
      method: "PATCH",
    },
  );
}

export function submitVolunteerPostingRecognizedMinutes(
  postingId: number,
  recognizedMinutes: number,
) {
  return fetchClient<null>(
    `${POSTING_ENDPOINT}/${postingId}/participations/hours`,
    {
      method: "PATCH",
      body: JSON.stringify({ recognizedMinutes }),
    },
  );
}
