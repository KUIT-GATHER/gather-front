import { useMutation, useQueryClient } from "@tanstack/react-query";

import { joinMeeting } from "@/features/team/api/team.api";
import { teamKeys } from "@/features/team/api/team.queries";

export function useJoinMeetingMutation(meetingId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => joinMeeting(meetingId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: teamKeys.detail(meetingId),
      });
      void queryClient.invalidateQueries({
        queryKey: teamKeys.home(meetingId),
      });
      void queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
}
