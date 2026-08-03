import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  applyVolunteerPostingParticipation,
  cancelVolunteerPostingParticipation,
} from "@/features/volunteer/api/volunteer.api";
import { myPageKeys } from "@/features/my/api/myPage.queries";
import { volunteerPostingKeys } from "@/features/volunteer/api/volunteer.queries";
import type {
  VolunteerPosting,
  VolunteerPostingParticipationAction,
  VolunteerPostingParticipationStatus,
} from "@/features/volunteer/types/volunteer.types";

function getParticipationAction(
  participationStatus: VolunteerPostingParticipationStatus | null,
): VolunteerPostingParticipationAction {
  switch (participationStatus) {
    case "APPLIED":
      return "CANCEL";
    case "CONFIRMED":
      return "COMPLETE";
    case "COMPLETED":
    case "REVIEWED":
      return "NONE";
    default:
      return "APPLY";
  }
}

function updateVolunteerPostingParticipationStatus(
  posting: VolunteerPosting | undefined,
  postingId: number,
  participationStatus: VolunteerPostingParticipationStatus | null,
) {
  if (!posting || posting.id !== postingId) {
    return posting;
  }

  return {
    ...posting,
    participationStatus,
    participationAction: getParticipationAction(participationStatus),
  };
}

export function useApplyVolunteerPostingParticipationMutation(
  postingId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: volunteerPostingKeys.participation(postingId),
    mutationFn: () => applyVolunteerPostingParticipation(postingId),
    onSuccess: (participation) => {
      queryClient.setQueryData<VolunteerPosting>(
        volunteerPostingKeys.detail(postingId),
        (posting) =>
          updateVolunteerPostingParticipationStatus(
            posting,
            postingId,
            participation.status,
          ),
      );
      void queryClient.invalidateQueries({
        queryKey: volunteerPostingKeys.detail(postingId),
      });
      void queryClient.invalidateQueries({
        queryKey: myPageKeys.activitiesAll(),
      });
    },
  });
}

export function useCancelVolunteerPostingParticipationMutation(
  postingId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: volunteerPostingKeys.participation(postingId),
    mutationFn: () => cancelVolunteerPostingParticipation(postingId),
    onSuccess: () => {
      queryClient.setQueryData<VolunteerPosting>(
        volunteerPostingKeys.detail(postingId),
        (posting) =>
          updateVolunteerPostingParticipationStatus(posting, postingId, null),
      );
      void queryClient.invalidateQueries({
        queryKey: volunteerPostingKeys.detail(postingId),
      });
      void queryClient.invalidateQueries({
        queryKey: myPageKeys.activitiesAll(),
      });
    },
  });
}
