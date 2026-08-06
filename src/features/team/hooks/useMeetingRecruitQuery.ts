import { useQuery } from "@tanstack/react-query";

import { teamQueries } from "@/features/team/api/team.queries";

type UseMeetingRecruitQueryOptions = {
  enabled?: boolean;
};

export function useMeetingRecruitQuery(
  meetingId: number,
  postId: number,
  options: UseMeetingRecruitQueryOptions = {},
) {
  return useQuery({
    ...teamQueries.recruit(meetingId, postId),
    enabled: options.enabled,
  });
}
