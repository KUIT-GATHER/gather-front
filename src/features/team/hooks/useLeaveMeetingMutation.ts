import { useMutation, useQueryClient } from "@tanstack/react-query";

import { leaveMeeting } from "@/features/team/api/team.api";
import { teamKeys } from "@/features/team/api/team.queries";

type UseLeaveMeetingMutationOptions = {
  onSuccess?: () => void;
};

export function useLeaveMeetingMutation(
  meetingId: number,
  options: UseLeaveMeetingMutationOptions = {},
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: teamKeys.leave(meetingId),
    mutationFn: () => leaveMeeting(meetingId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teamKeys.detail(meetingId),
      });
      void queryClient.invalidateQueries({
        queryKey: teamKeys.home(meetingId),
      });
      void queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: teamKeys.my() });

      options.onSuccess?.();
    },
  });
}
