import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";

import { myPageKeys } from "@/features/my/api/myPage.queries";
import {
  createMeetingPostComment,
  createMeetingPost,
  deleteMeetingPostComment,
  deleteMeetingPost,
  toggleMeetingPostLike,
  updateMeetingPostComment,
  updateMeetingPost,
} from "@/features/team/api/team.api";
import { teamKeys } from "@/features/team/api/team.queries";

import type {
  MeetingPost,
  MeetingPostComment,
  MeetingPostCommentCreateRequest,
  MeetingPostCommentPage,
  MeetingPostCommentUpdateRequest,
  MeetingPostCreateRequest,
  MeetingPostLikeResponse,
  MeetingPostUpdateRequest,
} from "@/features/team/types/team.types";

function updatePostDetail(
  post: MeetingPost | undefined,
  updater: (post: MeetingPost) => MeetingPost,
) {
  return post ? updater(post) : post;
}

function applyPostLikeResult(
  post: MeetingPost | undefined,
  result: MeetingPostLikeResponse,
) {
  return updatePostDetail(post, (currentPost) => ({
    ...currentPost,
    liked: result.liked,
    likeCount: result.likeCount,
  }));
}

function updatePostCommentCount(post: MeetingPost | undefined, delta: number) {
  return updatePostDetail(post, (currentPost) => ({
    ...currentPost,
    commentCount: Math.max(0, currentPost.commentCount + delta),
  }));
}

function updatePostCommentPage(
  data: InfiniteData<MeetingPostCommentPage> | undefined,
  updatedComment: MeetingPostComment,
) {
  if (!data) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      content: page.content.map((comment) =>
        comment.commentId === updatedComment.commentId
          ? updatedComment
          : comment,
      ),
    })),
  };
}

export function useCreateMeetingPostMutation(meetingId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: teamKeys.createPost(meetingId),
    mutationFn: (payload: MeetingPostCreateRequest) =>
      createMeetingPost(meetingId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teamKeys.posts(meetingId),
      });
      void queryClient.invalidateQueries({
        queryKey: myPageKeys.badges(),
      });
    },
  });
}

export function useUpdateMeetingPostMutation(
  meetingId: number,
  postId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: teamKeys.updatePost(meetingId, postId),
    mutationFn: (payload: MeetingPostUpdateRequest) =>
      updateMeetingPost(meetingId, postId, payload),
    onSuccess: (post) => {
      queryClient.setQueryData(teamKeys.post(meetingId, postId), post);
      void queryClient.invalidateQueries({
        queryKey: teamKeys.posts(meetingId),
      });
    },
  });
}

export function useDeleteMeetingPostMutation(
  meetingId: number,
  postId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: teamKeys.deletePost(meetingId, postId),
    mutationFn: () => deleteMeetingPost(meetingId, postId),
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: teamKeys.post(meetingId, postId),
      });
      void queryClient.invalidateQueries({
        queryKey: teamKeys.posts(meetingId),
      });
    },
  });
}

export function useToggleMeetingPostLikeMutation(
  meetingId: number,
  postId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: teamKeys.togglePostLike(meetingId, postId),
    mutationFn: () => toggleMeetingPostLike(meetingId, postId),
    onSuccess: (result) => {
      queryClient.setQueryData<MeetingPost>(
        teamKeys.post(meetingId, postId),
        (post) => applyPostLikeResult(post, result),
      );
      void queryClient.invalidateQueries({
        queryKey: teamKeys.posts(meetingId),
      });
    },
  });
}

export function useCreateMeetingPostCommentMutation(
  meetingId: number,
  postId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: teamKeys.createPostComment(meetingId, postId),
    mutationFn: (payload: MeetingPostCommentCreateRequest) =>
      createMeetingPostComment(meetingId, postId, payload),
    onSuccess: () => {
      queryClient.setQueryData<MeetingPost>(
        teamKeys.post(meetingId, postId),
        (post) => updatePostCommentCount(post, 1),
      );
      void queryClient.invalidateQueries({
        queryKey: teamKeys.postComments(meetingId, postId),
      });
      void queryClient.invalidateQueries({
        queryKey: teamKeys.posts(meetingId),
      });
      void queryClient.invalidateQueries({
        queryKey: myPageKeys.badges(),
      });
    },
  });
}

export function useUpdateMeetingPostCommentMutation(
  meetingId: number,
  postId: number,
  commentId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: teamKeys.updatePostComment(meetingId, postId, commentId),
    mutationFn: (payload: MeetingPostCommentUpdateRequest) =>
      updateMeetingPostComment(meetingId, postId, commentId, payload),
    onSuccess: (comment) => {
      queryClient.setQueriesData<InfiniteData<MeetingPostCommentPage>>(
        { queryKey: teamKeys.postComments(meetingId, postId) },
        (data) => updatePostCommentPage(data, comment),
      );
      void queryClient.invalidateQueries({
        queryKey: teamKeys.postComments(meetingId, postId),
      });
    },
  });
}

export function useDeleteMeetingPostCommentMutation(
  meetingId: number,
  postId: number,
  commentId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: teamKeys.deletePostComment(meetingId, postId, commentId),
    mutationFn: () => deleteMeetingPostComment(meetingId, postId, commentId),
    onSuccess: () => {
      queryClient.setQueryData<MeetingPost>(
        teamKeys.post(meetingId, postId),
        (post) => updatePostCommentCount(post, -1),
      );
      void queryClient.invalidateQueries({
        queryKey: teamKeys.postComments(meetingId, postId),
      });
      void queryClient.invalidateQueries({
        queryKey: teamKeys.posts(meetingId),
      });
    },
  });
}
