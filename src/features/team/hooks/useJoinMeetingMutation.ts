import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { joinMeeting } from "@/features/team/api/team.api";
import { teamKeys } from "@/features/team/api/team.queries";

type UseJoinMeetingMutationOptions = {
  invalidateOnSuccess?: boolean;
  onSuccess?: () => void;
};

export function useJoinMeetingMutation(
  meetingId: number,
  options: UseJoinMeetingMutationOptions = {},
) {
  const queryClient = useQueryClient();
  const invalidateMeetingQueries = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: teamKeys.detail(meetingId),
    });
    void queryClient.invalidateQueries({
      queryKey: teamKeys.home(meetingId),
    });
    void queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
  }, [meetingId, queryClient]);
  const mutation = useMutation({
    mutationFn: () => joinMeeting(meetingId),
    onSuccess: () => {
      if (options.invalidateOnSuccess !== false) {
        invalidateMeetingQueries();
      }

      options.onSuccess?.();
    },
  });

  return { ...mutation, invalidateMeetingQueries };
}
