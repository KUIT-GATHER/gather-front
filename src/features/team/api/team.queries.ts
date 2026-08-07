import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import {
  getBookmarkedMeetings,
  getMeetingPost,
  getMeetingPostComments,
  getMeeting,
  getMeetingHome,
  getMeetingPosts,
  getMeetingRecommendedKeywords,
  getMeetings,
  getMyMeetings,
  getMyMeetingActivityAppliedRecruits,
  getMyMeetingActivityCommentedPosts,
  getMyMeetingActivityPosts,
  getMyMeetingActivitySummary,
  getRecommendedMeetings,
} from "@/features/team/api/team.api";
import {
  getMeetingImages,
  getMeetingManageImages,
} from "@/features/team/api/meetingImage.api";
import { getReviewableActivities } from "@/features/team/api/meetingPost.api";
import {
  getManagedMeetingRecruits,
  getMeetingRecruit,
  getRecruitParticipant,
  getRecruitParticipants,
} from "@/features/team/api/meetingRecruit.api";
import {
  getMeetingJoinRequest,
  getMeetingJoinRequests,
  getMeetingMember,
} from "@/features/team/api/meetingManagement.api";

import type {
  BookmarkedMeetingInfiniteParams,
  MeetingActivityListParams,
  MeetingInfiniteParams,
  MeetingListParams,
  MeetingPostCommentListParams,
  MeetingPostListParams,
  MeetingJoinRequestStatus,
} from "../types/team.types";

type RecommendationScope = "guest" | "member";

export const teamKeys = {
  all: ["meetings"] as const,
  lists: () => [...teamKeys.all, "list"] as const,
  bookmarkedLists: () => [...teamKeys.all, "bookmarked"] as const,
  list: (params: MeetingListParams = {}) =>
    [...teamKeys.lists(), params] as const,
  recommended: (scope: RecommendationScope) =>
    [...teamKeys.all, "recommended", scope] as const,
  infiniteList: (params: MeetingInfiniteParams = {}) =>
    [...teamKeys.lists(), "infinite", params] as const,
  infiniteBookmarks: (params: BookmarkedMeetingInfiniteParams = {}) =>
    [...teamKeys.bookmarkedLists(), "infinite", params] as const,
  my: () => [...teamKeys.all, "my"] as const,
  recommendedKeywords: () => [...teamKeys.all, "recommendedKeywords"] as const,
  create: () => [...teamKeys.all, "create"] as const,
  details: () => [...teamKeys.all, "detail"] as const,
  detail: (meetingId: number) => [...teamKeys.details(), meetingId] as const,
  images: (meetingId: number) =>
    [...teamKeys.detail(meetingId), "images"] as const,
  manage: (meetingId: number) =>
    [...teamKeys.detail(meetingId), "manage"] as const,
  manageImages: (meetingId: number) =>
    [...teamKeys.manage(meetingId), "images"] as const,
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
  myActivity: (meetingId: number) =>
    [...teamKeys.detail(meetingId), "myActivity"] as const,
  myActivitySummary: (meetingId: number) =>
    [...teamKeys.myActivity(meetingId), "summary"] as const,
  myActivityPosts: (
    meetingId: number,
    params: MeetingActivityListParams = {},
  ) => [...teamKeys.myActivity(meetingId), "posts", params] as const,
  myActivityCommentedPosts: (
    meetingId: number,
    params: MeetingActivityListParams = {},
  ) => [...teamKeys.myActivity(meetingId), "commentedPosts", params] as const,
  myActivityAppliedRecruits: (
    meetingId: number,
    params: MeetingActivityListParams = {},
  ) => [...teamKeys.myActivity(meetingId), "appliedRecruits", params] as const,
  joinRequests: (meetingId: number, status?: MeetingJoinRequestStatus) =>
    [...teamKeys.detail(meetingId), "joinRequests", status ?? "ALL"] as const,
  joinRequest: (meetingId: number, joinRequestId: number) =>
    [...teamKeys.detail(meetingId), "joinRequest", joinRequestId] as const,

  approveJoinRequest: (meetingId: number) =>
    [...teamKeys.detail(meetingId), "joinRequests", "approve"] as const,

  rejectJoinRequest: (meetingId: number) =>
    [...teamKeys.detail(meetingId), "joinRequests", "reject"] as const,
  restoreJoinRequest: (meetingId: number) =>
    [...teamKeys.detail(meetingId), "joinRequests", "restore"] as const,
  member: (meetingId: number, userId: number) =>
    [...teamKeys.detail(meetingId), "member", userId] as const,
  updateMeeting: (meetingId: number) =>
    [...teamKeys.manage(meetingId), "update"] as const,
  disband: (meetingId: number) =>
    [...teamKeys.manage(meetingId), "disband"] as const,
  cancelJoin: (meetingId: number) =>
    [...teamKeys.detail(meetingId), "cancelJoin"] as const,
  posts: (meetingId: number) =>
    [...teamKeys.detail(meetingId), "posts"] as const,
  managedRecruits: (meetingId: number) =>
    [...teamKeys.manage(meetingId), "recruits"] as const,
  postList: (meetingId: number, params: MeetingPostListParams = {}) =>
    [...teamKeys.posts(meetingId), params] as const,
  post: (meetingId: number, postId: number) =>
    [...teamKeys.posts(meetingId), "detail", postId] as const,
  recruit: (meetingId: number, postId: number) =>
    [...teamKeys.post(meetingId, postId), "recruit"] as const,
  recruitForViewer: (
    meetingId: number,
    postId: number,
    isAuthenticated: boolean,
  ) =>
    [
      ...teamKeys.recruit(meetingId, postId),
      isAuthenticated ? "authenticated" : "anonymous",
    ] as const,
  reviewableActivities: (meetingId: number) =>
    [...teamKeys.posts(meetingId), "reviewableActivities"] as const,
  recruitParticipants: (meetingId: number, postId: number) =>
    [...teamKeys.recruit(meetingId, postId), "participants"] as const,
  recruitParticipant: (
    meetingId: number,
    postId: number,
    participationId: number,
  ) =>
    [
      ...teamKeys.recruitParticipants(meetingId, postId),
      participationId,
    ] as const,
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
  leave: (meetingId: number) =>
    [...teamKeys.detail(meetingId), "leave"] as const,
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

  infiniteBookmarks: (params: BookmarkedMeetingInfiniteParams = {}) =>
    infiniteQueryOptions({
      queryKey: teamKeys.infiniteBookmarks(params),
      initialPageParam: 0,
      queryFn: ({ pageParam }) =>
        getBookmarkedMeetings({ ...params, page: pageParam }),
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

  myActivitySummary: (meetingId: number) =>
    queryOptions({
      queryKey: teamKeys.myActivitySummary(meetingId),
      queryFn: () => getMyMeetingActivitySummary(meetingId),
    }),

  myActivityPosts: (
    meetingId: number,
    params: MeetingActivityListParams = {},
  ) =>
    infiniteQueryOptions({
      queryKey: teamKeys.myActivityPosts(meetingId, params),
      initialPageParam: 0,
      queryFn: ({ pageParam }) =>
        getMyMeetingActivityPosts(meetingId, { ...params, page: pageParam }),
      getNextPageParam: (lastPage) => {
        const nextPage = lastPage.page + 1;

        return nextPage < lastPage.totalPages ? nextPage : undefined;
      },
    }),

  myActivityCommentedPosts: (
    meetingId: number,
    params: MeetingActivityListParams = {},
  ) =>
    infiniteQueryOptions({
      queryKey: teamKeys.myActivityCommentedPosts(meetingId, params),
      initialPageParam: 0,
      queryFn: ({ pageParam }) =>
        getMyMeetingActivityCommentedPosts(meetingId, {
          ...params,
          page: pageParam,
        }),
      getNextPageParam: (lastPage) => {
        const nextPage = lastPage.page + 1;

        return nextPage < lastPage.totalPages ? nextPage : undefined;
      },
    }),

  myActivityAppliedRecruits: (
    meetingId: number,
    params: MeetingActivityListParams = {},
  ) =>
    infiniteQueryOptions({
      queryKey: teamKeys.myActivityAppliedRecruits(meetingId, params),
      initialPageParam: 0,
      queryFn: ({ pageParam }) =>
        getMyMeetingActivityAppliedRecruits(meetingId, {
          ...params,
          page: pageParam,
        }),
      getNextPageParam: (lastPage) => {
        const nextPage = lastPage.page + 1;

        return nextPage < lastPage.totalPages ? nextPage : undefined;
      },
    }),

  joinRequests: (meetingId: number, status?: MeetingJoinRequestStatus) =>
    queryOptions({
      queryKey: teamKeys.joinRequests(meetingId, status),
      queryFn: () => getMeetingJoinRequests(meetingId, status),
    }),

  joinRequest: (meetingId: number, joinRequestId: number) =>
    queryOptions({
      queryKey: teamKeys.joinRequest(meetingId, joinRequestId),
      queryFn: () => getMeetingJoinRequest(meetingId, joinRequestId),
    }),

  member: (meetingId: number, userId: number) =>
    queryOptions({
      queryKey: teamKeys.member(meetingId, userId),
      queryFn: () => getMeetingMember(meetingId, userId),
    }),

  managedRecruits: (meetingId: number) =>
    queryOptions({
      queryKey: teamKeys.managedRecruits(meetingId),
      queryFn: () => getManagedMeetingRecruits(meetingId),
    }),
  recruit: (meetingId: number, postId: number) =>
    queryOptions({
      queryKey: teamKeys.recruit(meetingId, postId),
      queryFn: () => getMeetingRecruit(meetingId, postId),
    }),

  recruitForViewer: (
    meetingId: number,
    postId: number,
    isAuthenticated: boolean,
  ) =>
    queryOptions({
      queryKey: teamKeys.recruitForViewer(meetingId, postId, isAuthenticated),
      queryFn: () => getMeetingRecruit(meetingId, postId),
    }),

  reviewableActivities: (meetingId: number) =>
    queryOptions({
      queryKey: teamKeys.reviewableActivities(meetingId),
      queryFn: () => getReviewableActivities(meetingId),
    }),

  recruitParticipants: (meetingId: number, postId: number) =>
    queryOptions({
      queryKey: teamKeys.recruitParticipants(meetingId, postId),
      queryFn: () => getRecruitParticipants(meetingId, postId),
    }),

  recruitParticipant: (
    meetingId: number,
    postId: number,
    participationId: number,
  ) =>
    queryOptions({
      queryKey: teamKeys.recruitParticipant(meetingId, postId, participationId),
      queryFn: () => getRecruitParticipant(meetingId, postId, participationId),
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

  manageImages: (meetingId: number) =>
    queryOptions({
      queryKey: teamKeys.manageImages(meetingId),
      queryFn: () => getMeetingManageImages(meetingId),
    }),
};
