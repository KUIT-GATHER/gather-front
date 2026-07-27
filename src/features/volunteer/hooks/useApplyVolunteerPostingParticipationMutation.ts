import { useMutation, useQueryClient } from "@tanstack/react-query";

import { applyVolunteerPostingParticipation } from "@/features/volunteer/api/volunteer.api";
import { volunteerPostingKeys } from "@/features/volunteer/api/volunteer.queries";
import type { VolunteerPosting } from "@/features/volunteer/types/volunteer.types";

export function useApplyVolunteerPostingParticipationMutation(
  postingId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: volunteerPostingKeys.participation(postingId),
    mutationFn: () => applyVolunteerPostingParticipation(postingId),
    onSuccess: () => {
      queryClient.setQueryData<VolunteerPosting>(
        volunteerPostingKeys.detail(postingId),
        (posting) =>
          posting && posting.id === postingId
            ? { ...posting, applied: true }
            : posting,
      );
      void queryClient.invalidateQueries({
        queryKey: volunteerPostingKeys.detail(postingId),
      });
    },
  });
}
