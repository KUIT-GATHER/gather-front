import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import {
  getMeetingPost,
  getMeetingPostComments,
  getMeeting,
  getMeetingHome,
  getMeetingPosts,
  getMeetingRecommendedKeywords,
  getMeetings,
  getMyMeetings,
  getRecommendedMeetings,
} from "@/features/team/api/team.api";
import { getMeetingImages } from "@/features/team/api/meetingImage.api";

import type {
  MeetingInfiniteParams,
  MeetingListParams,
  MeetingPostCommentListParams,
  MeetingPostListParams,
} from "../types/team.types";

type RecommendationScope = "guest" | "member";

export const teamKeys = {
  all: ["meetings"] as const,
  lists: () => [...teamKeys.all, "list"] as const,
  list: (params: MeetingListParams = {}) =>
    [...teamKeys.lists(), params] as const,
  recommended: (scope: RecommendationScope) =>
    [...teamKeys.all, "recommended", scope] as const,
  infiniteList: (params: MeetingInfiniteParams = {}) =>
    [...teamKeys.lists(), "infinite", params] as const,
  my: () => [...teamKeys.all, "my"] as const,
  recommendedKeywords: () => [...teamKeys.all, "recommendedKeywords"] as const,
  create: () => [...teamKeys.all, "create"] as const,
  details: () => [...teamKeys.all, "detail"] as const,
  detail: (meetingId: number) => [...teamKeys.details(), meetingId] as const,
  images: (meetingId: number) =>
    [...teamKeys.detail(meetingId), "images"] as const,
  detailForViewer: (meetingId: number, isAuthenticated: boolean) =>
    [
      ...teamKeys.detail(meetingId),
      isAuthenticated ? "authenticated" : "anonymous",
    ] as const,
  home: (meetingId: number) => [...teamKeys.detail(meetingId), "home"] as const,
  homeForViewer: (meetingId: number, isAuthenticated: boolean) =>
    [
      ...teamKeys.home(meetingId),
      isAuthenticated ? "authenticated" : "anonymous",
    ] as const,
  posts: (meetingId: number) =>
    [...teamKeys.detail(meetingId), "posts"] as const,
  postList: (meetingId: number, params: MeetingPostListParams = {}) =>
    [...teamKeys.posts(meetingId), params] as const,
  post: (meetingId: number, postId: number) =>
    [...teamKeys.posts(meetingId), "detail", postId] as const,
  postComments: (meetingId: number, postId: number) =>
    [...teamKeys.post(meetingId, postId), "comments"] as const,
  postCommentList: (
    meetingId: number,
    postId: number,
    params: MeetingPostCommentListParams = {},
  ) => [...teamKeys.postComments(meetingId, postId), params] as const,
  createPost: (meetingId: number) =>
    [...teamKeys.posts(meetingId), "create"] as const,
  updatePost: (meetingId: number, postId: number) =>
    [...teamKeys.post(meetingId, postId), "update"] as const,
  deletePost: (meetingId: number, postId: number) =>
    [...teamKeys.post(meetingId, postId), "delete"] as const,
  togglePostLike: (meetingId: number, postId: number) =>
    [...teamKeys.post(meetingId, postId), "like"] as const,
  createPostComment: (meetingId: number, postId: number) =>
    [...teamKeys.postComments(meetingId, postId), "create"] as const,
  updatePostComment: (meetingId: number, postId: number, commentId: number) =>
    [...teamKeys.postComments(meetingId, postId), "update", commentId] as const,
  deletePostComment: (meetingId: number, postId: number, commentId: number) =>
    [...teamKeys.postComments(meetingId, postId), "delete", commentId] as const,
  bookmark: (meetingId: number) =>
    [...teamKeys.detail(meetingId), "bookmark"] as const,
};

export const teamQueries = {
  recommendedKeywords: () =>
    queryOptions({
      queryKey: teamKeys.recommendedKeywords(),
      queryFn: getMeetingRecommendedKeywords,
      staleTime: 24 * 60 * 60 * 1000,
    }),

  list: (params: MeetingListParams = {}) =>
    queryOptions({
      queryKey: teamKeys.list(params),
      queryFn: () => getMeetings(params),
    }),

  recommended: (scope: RecommendationScope) =>
    queryOptions({
      queryKey: teamKeys.recommended(scope),
      queryFn: getRecommendedMeetings,
    }),

  infiniteList: (params: MeetingInfiniteParams = {}) =>
    infiniteQueryOptions({
      queryKey: teamKeys.infiniteList(params),
      initialPageParam: 0,
      queryFn: ({ pageParam }) => getMeetings({ ...params, page: pageParam }),
      getNextPageParam: (lastPage) => {
        const nextPage = lastPage.page + 1;

        return nextPage < lastPage.totalPages ? nextPage : undefined;
      },
    }),

  my: () =>
    queryOptions({
      queryKey: teamKeys.my(),
      queryFn: getMyMeetings,
    }),

  detail: (meetingId: number, isAuthenticated: boolean) =>
    queryOptions({
      queryKey: teamKeys.detailForViewer(meetingId, isAuthenticated),
      queryFn: () => getMeeting(meetingId),
    }),

  home: (meetingId: number, isAuthenticated: boolean) =>
    queryOptions({
      queryKey: teamKeys.homeForViewer(meetingId, isAuthenticated),
      queryFn: () => getMeetingHome(meetingId),
    }),

  posts: (meetingId: number, params: MeetingPostListParams = {}) =>
    infiniteQueryOptions({
      queryKey: teamKeys.postList(meetingId, params),
      initialPageParam: 0,
      queryFn: ({ pageParam }) =>
        getMeetingPosts(meetingId, { ...params, page: pageParam }),
      getNextPageParam: (lastPage) => {
        const nextPage = lastPage.page + 1;

        return nextPage < lastPage.totalPages ? nextPage : undefined;
      },
    }),

  post: (meetingId: number, postId: number) =>
    queryOptions({
      queryKey: teamKeys.post(meetingId, postId),
      queryFn: () => getMeetingPost(meetingId, postId),
    }),

  postComments: (
    meetingId: number,
    postId: number,
    params: MeetingPostCommentListParams = {},
  ) =>
    infiniteQueryOptions({
      queryKey: teamKeys.postCommentList(meetingId, postId, params),
      initialPageParam: 0,
      queryFn: ({ pageParam }) =>
        getMeetingPostComments(meetingId, postId, {
          ...params,
          page: pageParam,
        }),
      getNextPageParam: (lastPage) => {
        const nextPage = lastPage.page + 1;

        return nextPage < lastPage.totalPages ? nextPage : undefined;
      },
    }),

  images: (meetingId: number) =>
    queryOptions({
      queryKey: teamKeys.images(meetingId),
      queryFn: () => getMeetingImages(meetingId),
    }),
};
