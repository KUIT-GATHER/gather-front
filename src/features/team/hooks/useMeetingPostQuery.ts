import { useQuery } from "@tanstack/react-query";

import { teamQueries } from "@/features/team/api/team.queries";

type UseMeetingPostQueryOptions = {
  enabled?: boolean;
};

export function useMeetingPostQuery(
  meetingId: number,
  postId: number,
  options: UseMeetingPostQueryOptions = {},
) {
  return useQuery({
    ...teamQueries.post(meetingId, postId),
    enabled: options.enabled,
  });
}
