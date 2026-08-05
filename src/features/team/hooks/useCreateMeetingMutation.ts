import { useMutation, useQueryClient } from "@tanstack/react-query";

import { myBadgeKeys } from "@/features/my/api/myBadge.api";
import { createMeeting } from "@/features/team/api/team.api";
import { teamKeys } from "@/features/team/api/team.queries";

export function useCreateMeetingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: teamKeys.create(),
    mutationFn: createMeeting,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: teamKeys.my() });
      void queryClient.invalidateQueries({ queryKey: myBadgeKeys.all });
    },
  });
}
