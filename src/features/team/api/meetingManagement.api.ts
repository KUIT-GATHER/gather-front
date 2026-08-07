import type {
  MeetingJoinResponse,
  MeetingJoinRequestDetail,
  MeetingMemberDetail,
} from "@/features/team/types/meetingManagement.types";
import type {
  MeetingDetail,
  MeetingJoinRequest,
  MeetingJoinRequestStatus,
  MeetingUpdateRequest,
} from "@/features/team/types/team.types";
import { fetchClient } from "@/shared/api/fetchClient";

const meetingsEndpoint = "/api/v1/meetings";

export function updateMeeting(
  meetingId: number,
  request: MeetingUpdateRequest,
) {
  return fetchClient<MeetingDetail>(`${meetingsEndpoint}/${meetingId}`, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export function disbandMeeting(meetingId: number) {
  return fetchClient<null>(`${meetingsEndpoint}/${meetingId}`, {
    method: "DELETE",
  });
}

export function cancelMyMeetingJoinRequest(meetingId: number) {
  return fetchClient<null>(`${meetingsEndpoint}/${meetingId}/join`, {
    method: "DELETE",
  });
}

export function requestMeetingJoin(meetingId: number) {
  return fetchClient<MeetingJoinResponse>(
    `${meetingsEndpoint}/${meetingId}/join`,
    {
      method: "POST",
    },
  );
}

export function getMeetingJoinRequests(
  meetingId: number,
  status?: MeetingJoinRequestStatus,
) {
  const query = status ? `?status=${status}` : "";
  return fetchClient<MeetingJoinRequest[]>(
    `${meetingsEndpoint}/${meetingId}/join-requests${query}`,
  );
}

export function getMeetingJoinRequest(
  meetingId: number,
  joinRequestId: number,
) {
  return fetchClient<MeetingJoinRequestDetail>(
    `${meetingsEndpoint}/${meetingId}/join-requests/${joinRequestId}`,
  );
}

export function restoreMeetingJoinRequest(
  meetingId: number,
  joinRequestId: number,
) {
  return fetchClient<MeetingJoinRequest>(
    `${meetingsEndpoint}/${meetingId}/join-requests/${joinRequestId}/pending`,
    { method: "PATCH" },
  );
}

export function getMeetingMember(meetingId: number, userId: number) {
  return fetchClient<MeetingMemberDetail>(
    `${meetingsEndpoint}/${meetingId}/members/${userId}`,
  );
}

export function removeMeetingMember(meetingId: number, userId: number) {
  return fetchClient<null>(
    `${meetingsEndpoint}/${meetingId}/members/${userId}`,
    { method: "DELETE" },
  );
}
