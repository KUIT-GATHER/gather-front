import { useMutation } from "@tanstack/react-query";

import { applyVolunteerPostingParticipation } from "@/features/volunteer/api/volunteer.api";
import { volunteerPostingKeys } from "@/features/volunteer/api/volunteer.queries";

export function useApplyVolunteerPostingParticipationMutation(
  postingId: number,
) {
  return useMutation({
    mutationKey: volunteerPostingKeys.participation(postingId),
    mutationFn: () => applyVolunteerPostingParticipation(postingId),
  });
}
