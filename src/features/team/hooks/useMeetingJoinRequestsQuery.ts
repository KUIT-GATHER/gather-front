import { useQuery } from "@tanstack/react-query";

import { teamQueries } from "@/features/team/api/team.queries";

type UseMeetingJoinRequestsQueryOptions = {
  enabled?: boolean;
};

export function useMeetingJoinRequestsQuery(
  meetingId: number,
  options: UseMeetingJoinRequestsQueryOptions = {},
) {
  return useQuery({
    ...teamQueries.joinRequests(meetingId),
    enabled: options.enabled,
  });
}
