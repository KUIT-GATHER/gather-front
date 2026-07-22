import { queryOptions } from "@tanstack/react-query";

import {
  getMeeting,
  getMeetingHome,
  getMeetingPosts,
  getMeetings,
} from "@/features/team/api/team.api";

import type {
  MeetingListParams,
  MeetingPostListParams,
} from "../types/team.types";

export const teamKeys = {
  all: ["meetings"] as const,
  lists: () => [...teamKeys.all, "list"] as const,
  list: (params: MeetingListParams = {}) =>
    [...teamKeys.lists(), params] as const,
  create: () => [...teamKeys.all, "create"] as const,
  details: () => [...teamKeys.all, "detail"] as const,
  detail: (meetingId: number) => [...teamKeys.details(), meetingId] as const,
  home: (meetingId: number) => [...teamKeys.detail(meetingId), "home"] as const,
  posts: (meetingId: number) =>
    [...teamKeys.detail(meetingId), "posts"] as const,
  postList: (meetingId: number, params: MeetingPostListParams = {}) =>
    [...teamKeys.posts(meetingId), params] as const,
  bookmark: (meetingId: number) =>
    [...teamKeys.detail(meetingId), "bookmark"] as const,
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

  home: (meetingId: number) =>
    queryOptions({
      queryKey: teamKeys.home(meetingId),
      queryFn: () => getMeetingHome(meetingId),
    }),

  posts: (meetingId: number, params: MeetingPostListParams = {}) =>
    queryOptions({
      queryKey: teamKeys.postList(meetingId, params),
      queryFn: () => getMeetingPosts(meetingId, params),
    }),
};
