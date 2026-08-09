import { useMutation, useQueryClient } from "@tanstack/react-query";

import { myPageKeys } from "@/features/my/api/myPage.queries";
import {
  cancelMyMeetingJoinRequest,
  disbandMeeting,
  removeMeetingMember,
  restoreMeetingJoinRequest,
  updateMeeting,
} from "@/features/team/api/meetingManagement.api";
import { teamKeys } from "@/features/team/api/team.queries";
import type { MeetingUpdateRequest } from "@/features/team/types/team.types";
import { volunteerPostingKeys } from "@/features/volunteer/api/volunteer.queries";
import {
  saveMeetingImages,
  type EditableMeetingImage,
} from "@/features/team/lib/meetingImageEditor";

export function useUpdateMeetingMutation(meetingId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: teamKeys.updateMeeting(meetingId),
    mutationFn: (request: MeetingUpdateRequest) =>
      updateMeeting(meetingId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teamKeys.detail(meetingId),
      });
      void queryClient.invalidateQueries({
        queryKey: teamKeys.home(meetingId),
      });
      void queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: teamKeys.my() });
      void queryClient.invalidateQueries({
        queryKey: volunteerPostingKeys.lists(),
      });
    },
  });
}

export function useSaveMeetingImagesMutation(meetingId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [...teamKeys.manageImages(meetingId), "save"],
    mutationFn: (images: EditableMeetingImage[]) =>
      saveMeetingImages(meetingId, images),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teamKeys.images(meetingId),
      });
      void queryClient.invalidateQueries({
        queryKey: teamKeys.manageImages(meetingId),
      });
      void queryClient.invalidateQueries({
        queryKey: teamKeys.detail(meetingId),
      });
      void queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: teamKeys.my() });
      void queryClient.invalidateQueries({
        queryKey: teamKeys.recommended("guest"),
      });
      void queryClient.invalidateQueries({
        queryKey: teamKeys.recommended("member"),
      });
      void queryClient.invalidateQueries({
        queryKey: teamKeys.bookmarkedLists(),
      });
      void queryClient.invalidateQueries({
        queryKey: volunteerPostingKeys.lists(),
      });
    },
  });
}

export function useCancelMyMeetingJoinRequestMutation(meetingId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: teamKeys.cancelJoin(meetingId),
    mutationFn: () => cancelMyMeetingJoinRequest(meetingId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teamKeys.home(meetingId),
      });
      void queryClient.invalidateQueries({
        queryKey: teamKeys.detail(meetingId),
      });
      void queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: teamKeys.my() });
    },
  });
}

export function useDisbandMeetingMutation(meetingId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: teamKeys.disband(meetingId),
    mutationFn: () => disbandMeeting(meetingId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: teamKeys.detail(meetingId) });
      void queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: teamKeys.my() });
      void queryClient.invalidateQueries({
        queryKey: volunteerPostingKeys.lists(),
      });
    },
  });
}

export function useRestoreMeetingJoinRequestMutation(meetingId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: teamKeys.restoreJoinRequest(meetingId),
    mutationFn: (joinRequestId: number) =>
      restoreMeetingJoinRequest(meetingId, joinRequestId),
    onSuccess: (_request, joinRequestId) => {
      void queryClient.invalidateQueries({
        queryKey: [...teamKeys.detail(meetingId), "joinRequests"],
      });
      void queryClient.invalidateQueries({
        queryKey: teamKeys.joinRequest(meetingId, joinRequestId),
      });
    },
  });
}

export function useRemoveMeetingMemberMutation(meetingId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [...teamKeys.manage(meetingId), "removeMember"],
    mutationFn: (userId: number) => removeMeetingMember(meetingId, userId),
    onSuccess: (_data, userId) => {
      queryClient.removeQueries({
        queryKey: teamKeys.member(meetingId, userId),
      });
      void queryClient.invalidateQueries({
        queryKey: teamKeys.home(meetingId),
      });
      void queryClient.invalidateQueries({
        queryKey: teamKeys.detail(meetingId),
      });
      void queryClient.invalidateQueries({ queryKey: teamKeys.my() });
      void queryClient.invalidateQueries({
        queryKey: myPageKeys.activitiesAll(),
      });
    },
  });
}
