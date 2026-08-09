import { useInfiniteQuery } from "@tanstack/react-query";

import { teamQueries } from "@/features/team/api/team.queries";

import type { MeetingPostCommentListParams } from "@/features/team/types/team.types";

export function useMeetingPostCommentsQuery(
  meetingId: number,
  postId: number,
  params: MeetingPostCommentListParams = {},
) {
  return useInfiniteQuery(teamQueries.postComments(meetingId, postId, params));
}
