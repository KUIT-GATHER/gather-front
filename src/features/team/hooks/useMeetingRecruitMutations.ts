import { useMutation, useQueryClient } from "@tanstack/react-query";

import { myPageKeys } from "@/features/my/api/myPage.queries";
import {
  confirmRecruitParticipants,
  createMeetingRecruit,
  rejectRecruitParticipant,
  toggleMeetingRecruitParticipation,
  updateMeetingRecruit,
  updateRecruitAttendance,
} from "@/features/team/api/meetingRecruit.api";
import { teamKeys } from "@/features/team/api/team.queries";
import type {
  MeetingRecruitRequest,
  UpdateAttendanceRequest,
} from "@/features/team/types/meetingRecruit.types";
import { volunteerPostingKeys } from "@/features/volunteer/api/volunteer.queries";

function invalidateRecruitData(
  queryClient: ReturnType<typeof useQueryClient>,
  meetingId: number,
  postId: number,
) {
  void queryClient.invalidateQueries({
    queryKey: teamKeys.recruit(meetingId, postId),
  });
  void queryClient.invalidateQueries({
    queryKey: teamKeys.post(meetingId, postId),
  });
  void queryClient.invalidateQueries({ queryKey: teamKeys.posts(meetingId) });
  void queryClient.invalidateQueries({
    queryKey: teamKeys.managedRecruits(meetingId),
  });
  void queryClient.invalidateQueries({
    queryKey: volunteerPostingKeys.lists(),
  });
}

export function useCreateMeetingRecruitMutation(meetingId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [...teamKeys.posts(meetingId), "createRecruit"],
    mutationFn: (request: MeetingRecruitRequest) =>
      createMeetingRecruit(meetingId, request),
    meta: {
      toast: {
        error: "봉사 공고를 등록하지 못했어요. 다시 시도해 주세요.",
        id: "meeting-recruit-save-toast",
      },
    },
    onSuccess: (recruit) =>
      invalidateRecruitData(queryClient, meetingId, recruit.postId),
  });
}

export function useUpdateMeetingRecruitMutation(
  meetingId: number,
  postId: number,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [...teamKeys.recruit(meetingId, postId), "update"],
    mutationFn: (request: MeetingRecruitRequest) =>
      updateMeetingRecruit(meetingId, postId, request),
    meta: {
      toast: {
        error: "봉사 공고를 수정하지 못했어요. 다시 시도해 주세요.",
        id: "meeting-recruit-save-toast",
      },
    },
    onSuccess: () => invalidateRecruitData(queryClient, meetingId, postId),
  });
}

export function useToggleMeetingRecruitParticipationMutation(
  meetingId: number,
  postId: number,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [...teamKeys.recruit(meetingId, postId), "participation"],
    mutationFn: () => toggleMeetingRecruitParticipation(meetingId, postId),
    onSuccess: () => {
      invalidateRecruitData(queryClient, meetingId, postId);
      void queryClient.invalidateQueries({
        queryKey: teamKeys.myActivity(meetingId),
      });
      void queryClient.invalidateQueries({
        queryKey: myPageKeys.activitiesAll(),
      });
    },
  });
}

export function useRejectRecruitParticipantMutation(
  meetingId: number,
  postId: number,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [...teamKeys.recruitParticipants(meetingId, postId), "reject"],
    mutationFn: (participationId: number) =>
      rejectRecruitParticipant(meetingId, postId, participationId),
    onSuccess: (_data, participationId) => {
      void queryClient.invalidateQueries({
        queryKey: teamKeys.recruitParticipants(meetingId, postId),
      });
      void queryClient.invalidateQueries({
        queryKey: teamKeys.recruitParticipant(
          meetingId,
          postId,
          participationId,
        ),
      });
      invalidateRecruitData(queryClient, meetingId, postId);
    },
  });
}

export function useConfirmRecruitParticipantsMutation(
  meetingId: number,
  postId: number,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [
      ...teamKeys.recruitParticipants(meetingId, postId),
      "confirm",
    ],
    mutationFn: () => confirmRecruitParticipants(meetingId, postId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teamKeys.recruitParticipants(meetingId, postId),
      });
      invalidateRecruitData(queryClient, meetingId, postId);
    },
  });
}

export function useUpdateRecruitAttendanceMutation(
  meetingId: number,
  postId: number,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [
      ...teamKeys.recruitParticipants(meetingId, postId),
      "attendance",
    ],
    mutationFn: ({
      participationId,
      request,
    }: {
      participationId: number;
      request: UpdateAttendanceRequest;
    }) => updateRecruitAttendance(meetingId, postId, participationId, request),
    onSuccess: (_data, { participationId }) => {
      void queryClient.invalidateQueries({
        queryKey: teamKeys.recruitParticipants(meetingId, postId),
      });
      void queryClient.invalidateQueries({
        queryKey: teamKeys.recruitParticipant(
          meetingId,
          postId,
          participationId,
        ),
      });
      invalidateRecruitData(queryClient, meetingId, postId);
      void queryClient.invalidateQueries({
        queryKey: myPageKeys.activitiesAll(),
      });
      void queryClient.invalidateQueries({ queryKey: myPageKeys.badges() });
    },
  });
}
