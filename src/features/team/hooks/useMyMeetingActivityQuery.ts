import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { teamQueries } from "@/features/team/api/team.queries";
import type { MeetingActivityListParams } from "@/features/team/types/team.types";

export function useMyMeetingActivitySummaryQuery(meetingId: number) {
  return useQuery(teamQueries.myActivitySummary(meetingId));
}

export function useMyMeetingActivityPostsQuery(
  meetingId: number,
  params: MeetingActivityListParams = {},
) {
  return useInfiniteQuery(teamQueries.myActivityPosts(meetingId, params));
}

export function useMyMeetingActivityCommentedPostsQuery(
  meetingId: number,
  params: MeetingActivityListParams = {},
) {
  return useInfiniteQuery(
    teamQueries.myActivityCommentedPosts(meetingId, params),
  );
}

export function useMyMeetingActivityAppliedRecruitsQuery(
  meetingId: number,
  params: MeetingActivityListParams = {},
) {
  return useInfiniteQuery(
    teamQueries.myActivityAppliedRecruits(meetingId, params),
  );
}
