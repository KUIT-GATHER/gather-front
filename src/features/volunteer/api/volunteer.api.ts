import { fetchClient } from "@/shared/api/fetchClient";

import type {
  VolunteerPosting,
  VolunteerPostingBookmarkResponse,
  VolunteerPostingListParams,
  VolunteerPostingPage,
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

export function getVolunteerPostings(params?: VolunteerPostingListParams) {
  return fetchClient<VolunteerPostingPage>(
    buildPostingListEndpoint(params),
    publicOptions,
  );
}

export function getVolunteerPosting(postingId: number) {
  return fetchClient<VolunteerPosting>(buildPostingEndpoint(postingId));
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
