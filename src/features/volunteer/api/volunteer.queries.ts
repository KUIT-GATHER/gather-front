import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
} from "@tanstack/react-query";

import {
  getBookmarkedVolunteerPostings,
  getRecommendedVolunteerPostings,
  getVolunteerPosting,
  getVolunteerPostingMeetings,
  getVolunteerPostingRecommendedKeywords,
  getVolunteerPostingMap,
  getVolunteerPostings,
} from "./volunteer.api";

import type {
  VolunteerPostingInfiniteParams,
  VolunteerPostingListParams,
  VolunteerPostingMeetingListParams,
  VolunteerPostingMapParams,
} from "../types/volunteer.types";

type RecommendationScope = "guest" | "member";
type ViewerScope = RecommendationScope;

function withPage(
  params: VolunteerPostingInfiniteParams,
  page: number,
): VolunteerPostingListParams {
  const { regionId, ...baseParams } = params;

  if (regionId !== undefined) {
    return { ...baseParams, page, regionId };
  }

  return { ...baseParams, page };
}

export const volunteerPostingKeys = {
  all: ["volunteerPostings"] as const,
  lists: () => [...volunteerPostingKeys.all, "list"] as const,
  maps: () => [...volunteerPostingKeys.all, "map"] as const,
  bookmarkedLists: () => [...volunteerPostingKeys.all, "bookmarked"] as const,
  list: (params: VolunteerPostingListParams = {}) =>
    [...volunteerPostingKeys.lists(), params] as const,
  recommended: (scope: RecommendationScope) =>
    [...volunteerPostingKeys.all, "recommended", scope] as const,
  map: (params: VolunteerPostingMapParams | undefined) =>
    [...volunteerPostingKeys.maps(), params ?? null] as const,
  infiniteList: (params: VolunteerPostingInfiniteParams = {}) =>
    [...volunteerPostingKeys.lists(), "infinite", params] as const,
  infiniteBookmarks: (params: VolunteerPostingInfiniteParams = {}) =>
    [...volunteerPostingKeys.bookmarkedLists(), "infinite", params] as const,
  details: () => [...volunteerPostingKeys.all, "detail"] as const,
  detail: (postingId: number) =>
    [...volunteerPostingKeys.details(), postingId] as const,
  detailForViewer: (postingId: number, viewer: ViewerScope) =>
    [...volunteerPostingKeys.detail(postingId), "viewer", viewer] as const,
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

  map: (params: VolunteerPostingMapParams | undefined) =>
    queryOptions({
      queryKey: volunteerPostingKeys.map(params),
      queryFn: () => {
        if (!params) {
          throw new Error("Map bounds are required.");
        }

        return getVolunteerPostingMap(params);
      },
      placeholderData: keepPreviousData,
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

  infiniteBookmarks: (params: VolunteerPostingInfiniteParams = {}) =>
    infiniteQueryOptions({
      queryKey: volunteerPostingKeys.infiniteBookmarks(params),
      initialPageParam: 0,
      queryFn: ({ pageParam }) =>
        getBookmarkedVolunteerPostings(withPage(params, pageParam)),
      getNextPageParam: (lastPage) => {
        const nextPage = lastPage.page + 1;

        return nextPage < lastPage.totalPages ? nextPage : undefined;
      },
    }),

  detail: (postingId: number, viewer: ViewerScope) =>
    queryOptions({
      queryKey: volunteerPostingKeys.detailForViewer(postingId, viewer),
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
