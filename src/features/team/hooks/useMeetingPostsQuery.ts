import { useInfiniteQuery } from "@tanstack/react-query";

import { teamQueries } from "@/features/team/api/team.queries";

import type { MeetingPostListParams } from "@/features/team/types/team.types";

export function useMeetingPostsQuery(
  meetingId: number,
  params: MeetingPostListParams = {},
) {
  return useInfiniteQuery(teamQueries.posts(meetingId, params));
}
