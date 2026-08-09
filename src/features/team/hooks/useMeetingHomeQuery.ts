import { useQuery } from "@tanstack/react-query";

import { teamQueries } from "@/features/team/api/team.queries";

type UseMeetingHomeQueryOptions = {
  enabled?: boolean;
  isAuthenticated?: boolean;
};

export function useMeetingHomeQuery(
  meetingId: number,
  options: UseMeetingHomeQueryOptions = {},
) {
  return useQuery({
    ...teamQueries.home(meetingId, options.isAuthenticated ?? false),
    enabled: options.enabled,
  });
}
