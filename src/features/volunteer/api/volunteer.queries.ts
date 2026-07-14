import { queryOptions } from "@tanstack/react-query";

import { getVolunteerPosting, getVolunteerPostings } from "./volunteer.api";

import type { VolunteerPostingListParams } from "../types/volunteer.types";

export const volunteerPostingKeys = {
  all: ["volunteerPostings"] as const,
  lists: () => [...volunteerPostingKeys.all, "list"] as const,
  list: (params: VolunteerPostingListParams = {}) =>
    [...volunteerPostingKeys.lists(), params] as const,
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

  detail: (postingId: number) =>
    queryOptions({
      queryKey: volunteerPostingKeys.detail(postingId),
      queryFn: () => getVolunteerPosting(postingId),
    }),
};
