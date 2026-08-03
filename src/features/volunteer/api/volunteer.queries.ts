import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import {
  getRecommendedVolunteerPostings,
  getVolunteerPosting,
  getVolunteerPostingMeetings,
  getVolunteerPostingRecommendedKeywords,
  getVolunteerPostings,
} from "./volunteer.api";

import type {
  VolunteerPostingInfiniteParams,
  VolunteerPostingListParams,
  VolunteerPostingMeetingListParams,
} from "../types/volunteer.types";

type RecommendationScope = "guest" | "member";

function withPage(
  params: VolunteerPostingInfiniteParams,
  page: number,
): VolunteerPostingListParams {
  const { regionId, regionGroupId, ...baseParams } = params;

  if (regionId !== undefined) {
    return { ...baseParams, page, regionId };
  }

  if (regionGroupId !== undefined) {
    return { ...baseParams, page, regionGroupId };
  }

  return { ...baseParams, page };
}

export const volunteerPostingKeys = {
  all: ["volunteerPostings"] as const,
  lists: () => [...volunteerPostingKeys.all, "list"] as const,
  list: (params: VolunteerPostingListParams = {}) =>
    [...volunteerPostingKeys.lists(), params] as const,
  recommended: (scope: RecommendationScope) =>
    [...volunteerPostingKeys.all, "recommended", scope] as const,
  infiniteList: (params: VolunteerPostingInfiniteParams = {}) =>
    [...volunteerPostingKeys.lists(), "infinite", params] as const,
  details: () => [...volunteerPostingKeys.all, "detail"] as const,
  detail: (postingId: number) =>
    [...volunteerPostingKeys.details(), postingId] as const,
  bookmark: (postingId: number) =>
    [...volunteerPostingKeys.detail(postingId), "bookmark"] as const,
  meetings: (
    postingId: number,
    params: VolunteerPostingMeetingListParams = {},
    isAuthenticated: boolean,
  ) =>
    [
      ...volunteerPostingKeys.detail(postingId),
      "meetings",
      params,
      isAuthenticated ? "authenticated" : "anonymous",
    ] as const,
  participation: (postingId: number) =>
    [...volunteerPostingKeys.detail(postingId), "participation"] as const,
  participationComplete: (postingId: number) =>
    [...volunteerPostingKeys.participation(postingId), "complete"] as const,
  participationHours: (postingId: number) =>
    [...volunteerPostingKeys.participation(postingId), "hours"] as const,
  recommendedKeywords: () =>
    [...volunteerPostingKeys.all, "recommendedKeywords"] as const,
};

export const volunteerPostingQueries = {
  list: (params: VolunteerPostingListParams = {}) =>
    queryOptions({
      queryKey: volunteerPostingKeys.list(params),
      queryFn: () => getVolunteerPostings(params),
    }),

  recommended: (scope: RecommendationScope) =>
    queryOptions({
      queryKey: volunteerPostingKeys.recommended(scope),
      queryFn: getRecommendedVolunteerPostings,
    }),

  infiniteList: (params: VolunteerPostingInfiniteParams = {}) =>
    infiniteQueryOptions({
      queryKey: volunteerPostingKeys.infiniteList(params),
      initialPageParam: 0,
      queryFn: ({ pageParam }) =>
        getVolunteerPostings(withPage(params, pageParam)),
      getNextPageParam: (lastPage) => {
        const nextPage = lastPage.page + 1;

        return nextPage < lastPage.totalPages ? nextPage : undefined;
      },
    }),

  detail: (postingId: number) =>
    queryOptions({
      queryKey: volunteerPostingKeys.detail(postingId),
      queryFn: () => getVolunteerPosting(postingId),
    }),

  meetings: (
    postingId: number,
    params: VolunteerPostingMeetingListParams = {},
    isAuthenticated: boolean,
  ) =>
    queryOptions({
      queryKey: volunteerPostingKeys.meetings(
        postingId,
        params,
        isAuthenticated,
      ),
      queryFn: () => getVolunteerPostingMeetings(postingId, params),
    }),

  recommendedKeywords: () =>
    queryOptions({
      queryKey: volunteerPostingKeys.recommendedKeywords(),
      queryFn: getVolunteerPostingRecommendedKeywords,
      staleTime: 24 * 60 * 60 * 1000,
    }),
};
