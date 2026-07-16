import { queryOptions } from "@tanstack/react-query";

import { getMeeting, getMeetings } from "@/features/team/api/team.api";

import type { MeetingListParams } from "../types/team.types";

export const teamKeys = {
  all: ["meetings"] as const,
  lists: () => [...teamKeys.all, "list"] as const,
  list: (params: MeetingListParams = {}) =>
    [...teamKeys.lists(), params] as const,
  details: () => [...teamKeys.all, "detail"] as const,
  detail: (meetingId: number) => [...teamKeys.details(), meetingId] as const,
};

export const teamQueries = {
  list: (params: MeetingListParams = {}) =>
    queryOptions({
      queryKey: teamKeys.list(params),
      queryFn: () => getMeetings(params),
    }),

  detail: (meetingId: number) =>
    queryOptions({
      queryKey: teamKeys.detail(meetingId),
      queryFn: () => getMeeting(meetingId),
    }),
};
