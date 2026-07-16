import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import { getVolunteerPosting, getVolunteerPostings } from "./volunteer.api";

import type {
  VolunteerPostingInfiniteParams,
  VolunteerPostingListParams,
} from "../types/volunteer.types";

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
  infiniteList: (params: VolunteerPostingInfiniteParams = {}) =>
    [...volunteerPostingKeys.lists(), "infinite", params] as const,
  details: () => [...volunteerPostingKeys.all, "detail"] as const,
  detail: (postingId: number) =>
    [...volunteerPostingKeys.details(), postingId] as const,
};

export const volunteerPostingQueries = {
  list: (params: VolunteerPostingListParams = {}) =>
    queryOptions({
      queryKey: volunteerPostingKeys.list(params),
      queryFn: () => getVolunteerPostings(params),
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
};
