import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  approveMeetingJoinRequest,
  rejectMeetingJoinRequest,
} from "@/features/team/api/team.api";
import { teamKeys } from "@/features/team/api/team.queries";
import type { MeetingJoinRequest } from "@/features/team/types/team.types";

function removeJoinRequest(
  requests: MeetingJoinRequest[] | undefined,
  joinRequestId: number,
) {
  return requests?.filter((request) => request.joinRequestId !== joinRequestId);
}

export function useApproveMeetingJoinRequestMutation(meetingId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: teamKeys.approveJoinRequest(meetingId),
    mutationFn: (joinRequestId: number) =>
      approveMeetingJoinRequest(meetingId, joinRequestId),

    onSuccess: (approvedRequest) => {
      queryClient.setQueryData<MeetingJoinRequest[]>(
        teamKeys.joinRequests(meetingId),
        (requests) =>
          removeJoinRequest(requests, approvedRequest.joinRequestId),
      );

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

    onSuccess: (rejectedRequest) => {
      queryClient.setQueryData<MeetingJoinRequest[]>(
        teamKeys.joinRequests(meetingId),
        (requests) =>
          removeJoinRequest(requests, rejectedRequest.joinRequestId),
      );
    },
  });
}
