import { useQuery } from "@tanstack/react-query";

import { volunteerPostingQueries } from "@/features/volunteer/api/volunteer.queries";

import type { VolunteerPostingMeetingListParams } from "@/features/volunteer/types/volunteer.types";

export function useVolunteerPostingMeetingsQuery(
  postingId: number,
  params: VolunteerPostingMeetingListParams = {},
) {
  return useQuery(volunteerPostingQueries.meetings(postingId, params));
}
