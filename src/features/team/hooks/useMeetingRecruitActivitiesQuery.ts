import { useQuery } from "@tanstack/react-query";

import { teamQueries } from "@/features/team/api/team.queries";

type UseMeetingRecruitActivitiesQueryOptions = {
  enabled?: boolean;
};

export function useMeetingRecruitActivitiesQuery(
  meetingId: number,
  options: UseMeetingRecruitActivitiesQueryOptions = {},
) {
  return useQuery({
    ...teamQueries.managedRecruits(meetingId),
    enabled: options.enabled,
  });
}
