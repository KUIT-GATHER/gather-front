import { useQuery } from "@tanstack/react-query";

import { volunteerPostingQueries } from "@/features/volunteer/api/volunteer.queries";

import type { VolunteerPostingMeetingListParams } from "@/features/volunteer/types/volunteer.types";

type UseVolunteerPostingMeetingsQueryOptions = {
  enabled?: boolean;
  isAuthenticated?: boolean;
};

export function useVolunteerPostingMeetingsQuery(
  postingId: number,
  params: VolunteerPostingMeetingListParams = {},
  options: UseVolunteerPostingMeetingsQueryOptions = {},
) {
  return useQuery({
    ...volunteerPostingQueries.meetings(
      postingId,
      params,
      options.isAuthenticated ?? false,
    ),
    enabled: options.enabled,
  });
}
