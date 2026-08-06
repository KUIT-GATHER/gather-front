import { useMutation, useQueryClient } from "@tanstack/react-query";

import { myBadgeKeys } from "@/features/my/api/myBadge.api";
import {
  applyVolunteerPostingParticipation,
  cancelVolunteerPostingParticipation,
  completeVolunteerPostingParticipation,
  submitVolunteerPostingRecognizedMinutes,
} from "@/features/volunteer/api/volunteer.api";
import { myPageKeys } from "@/features/my/api/myPage.queries";
import { volunteerPostingKeys } from "@/features/volunteer/api/volunteer.queries";
import type {
  VolunteerPosting,
  VolunteerPostingParticipationAction,
  VolunteerPostingParticipationStatus,
} from "@/features/volunteer/types/volunteer.types";

function isActivityEnded(posting: VolunteerPosting) {
  const endDate = posting.actEndDate ?? posting.actStartDate;

  if (!endDate) {
    return false;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(endDate);

  if (!match) {
    return false;
  }

  const [, year, month, day] = match;
  const activityEndDate = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
  );

  if (
    activityEndDate.getFullYear() !== Number(year) ||
    activityEndDate.getMonth() !== Number(month) - 1 ||
    activityEndDate.getDate() !== Number(day)
  ) {
    return false;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return activityEndDate.getTime() <= today.getTime();
}

function getParticipationAction(
  participationStatus: VolunteerPostingParticipationStatus | null,
  activityEnded: boolean,
): VolunteerPostingParticipationAction {
  switch (participationStatus) {
    case "APPLIED":
    case "CONFIRMED":
      return activityEnded ? "COMPLETE" : "CANCEL";
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
    participationAction: getParticipationAction(
      participationStatus,
      isActivityEnded(posting),
    ),
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

export function useCompleteVolunteerPostingParticipationMutation(
  postingId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: volunteerPostingKeys.participationComplete(postingId),
    mutationFn: () => completeVolunteerPostingParticipation(postingId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: myBadgeKeys.all });
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
