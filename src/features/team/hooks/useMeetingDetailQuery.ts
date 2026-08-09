import { useQuery } from "@tanstack/react-query";

import { teamQueries } from "@/features/team/api/team.queries";

type UseMeetingDetailQueryOptions = {
  enabled?: boolean;
  isAuthenticated?: boolean;
};

export function useMeetingDetailQuery(
  meetingId: number,
  options: UseMeetingDetailQueryOptions = {},
) {
  return useQuery({
    ...teamQueries.detail(meetingId, options.isAuthenticated ?? false),
    enabled: options.enabled,
  });
}
