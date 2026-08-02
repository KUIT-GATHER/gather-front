import { useQuery } from "@tanstack/react-query";

import { teamQueries } from "@/features/team/api/team.queries";

export function useMeetingPostQuery(meetingId: number, postId: number) {
  return useQuery(teamQueries.post(meetingId, postId));
}
