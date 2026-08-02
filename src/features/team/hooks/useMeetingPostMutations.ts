import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createMeetingPost,
  deleteMeetingPost,
  updateMeetingPost,
} from "@/features/team/api/team.api";
import { teamKeys } from "@/features/team/api/team.queries";

import type {
  MeetingPostCreateRequest,
  MeetingPostUpdateRequest,
} from "@/features/team/types/team.types";

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
