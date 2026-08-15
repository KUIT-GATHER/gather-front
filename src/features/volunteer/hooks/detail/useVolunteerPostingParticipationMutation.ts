import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  applyVolunteerPostingParticipation,
  cancelVolunteerPostingParticipation,
  completeVolunteerPostingParticipation,
  submitVolunteerPostingRecognizedMinutes,
} from "@/features/volunteer/api/volunteer.api";
import { myPageKeys } from "@/features/my/api/myPage.queries";
import { volunteerPostingKeys } from "@/features/volunteer/api/volunteer.queries";
import type { VolunteerPostingParticipationApplyRequest } from "@/features/volunteer/types/volunteer.types";

function invalidateVolunteerParticipationData(
  queryClient: ReturnType<typeof useQueryClient>,
  postingId: number,
) {
  void queryClient.invalidateQueries({
    queryKey: volunteerPostingKeys.detail(postingId),
  });
  void queryClient.invalidateQueries({
    queryKey: myPageKeys.activitiesAll(),
  });
}

export function useApplyVolunteerPostingParticipationMutation(
  postingId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: volunteerPostingKeys.participation(postingId),
    mutationFn: (request: VolunteerPostingParticipationApplyRequest) =>
      applyVolunteerPostingParticipation(postingId, request),
    onSuccess: () =>
      invalidateVolunteerParticipationData(queryClient, postingId),
  });
}

export function useCancelVolunteerPostingParticipationMutation(
  postingId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: volunteerPostingKeys.participation(postingId),
    mutationFn: () => cancelVolunteerPostingParticipation(postingId),
    onSuccess: () =>
      invalidateVolunteerParticipationData(queryClient, postingId),
  });
}

export function useCompleteVolunteerPostingParticipationMutation(
  postingId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: volunteerPostingKeys.participationComplete(postingId),
    mutationFn: () => completeVolunteerPostingParticipation(postingId),
    onSuccess: () => {
      invalidateVolunteerParticipationData(queryClient, postingId);
      void queryClient.invalidateQueries({
        queryKey: myPageKeys.badges(),
      });
    },
  });
}

export function useSubmitVolunteerPostingRecognizedMinutesMutation(
  postingId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: volunteerPostingKeys.participationHours(postingId),
    mutationFn: (recognizedMinutes: number) =>
      submitVolunteerPostingRecognizedMinutes(postingId, recognizedMinutes),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: volunteerPostingKeys.detail(postingId),
      });
    },
  });
}
