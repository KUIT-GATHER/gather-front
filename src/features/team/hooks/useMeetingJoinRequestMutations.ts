import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  approveMeetingJoinRequest,
  rejectMeetingJoinRequest,
} from "@/features/team/api/team.api";
import { teamKeys } from "@/features/team/api/team.queries";

export function useApproveMeetingJoinRequestMutation(meetingId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: teamKeys.approveJoinRequest(meetingId),
    mutationFn: (joinRequestId: number) =>
      approveMeetingJoinRequest(meetingId, joinRequestId),

    onSuccess: (_approvedRequest, joinRequestId) => {
      void queryClient.invalidateQueries({
        queryKey: [...teamKeys.detail(meetingId), "joinRequests"],
      });
      void queryClient.invalidateQueries({
        queryKey: teamKeys.joinRequest(meetingId, joinRequestId),
      });
      void queryClient.invalidateQueries({
        queryKey: teamKeys.home(meetingId),
      });
    },
  });
}

export function useRejectMeetingJoinRequestMutation(meetingId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: teamKeys.rejectJoinRequest(meetingId),
    mutationFn: (joinRequestId: number) =>
      rejectMeetingJoinRequest(meetingId, joinRequestId),

    onSuccess: (_rejectedRequest, joinRequestId) => {
      void queryClient.invalidateQueries({
        queryKey: [...teamKeys.detail(meetingId), "joinRequests"],
      });
      void queryClient.invalidateQueries({
        queryKey: teamKeys.joinRequest(meetingId, joinRequestId),
      });
    },
  });
}
