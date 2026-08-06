import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toggleMeetingRecruitParticipation } from "@/features/team/api/team.api";
import { teamKeys } from "@/features/team/api/team.queries";
import type {
  MeetingRecruitDetail,
  MeetingRecruitParticipationResponse,
} from "@/features/team/types/team.types";

function applyParticipationResult(
  recruit: MeetingRecruitDetail | undefined,
  result: MeetingRecruitParticipationResponse,
) {
  if (!recruit) {
    return recruit;
  }

  return {
    ...recruit,
    applied: result.applied,
    appliedCount: result.appliedCount,
    maxParticipants: result.maxParticipants,
    full: result.appliedCount >= result.maxParticipants,
  };
}

export function useMeetingRecruitParticipationMutation(
  meetingId: number,
  postId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: teamKeys.toggleRecruitParticipation(meetingId, postId),
    mutationFn: () => toggleMeetingRecruitParticipation(meetingId, postId),
    onSuccess: (result) => {
      queryClient.setQueryData<MeetingRecruitDetail>(
        teamKeys.recruit(meetingId, postId),
        (recruit) => applyParticipationResult(recruit, result),
      );
      void queryClient.invalidateQueries({
        queryKey: teamKeys.myActivitySummary(meetingId),
      });
      void queryClient.invalidateQueries({
        queryKey: teamKeys.myActivityAppliedRecruits(meetingId),
      });
    },
  });
}
