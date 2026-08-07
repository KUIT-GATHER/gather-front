import type {
  ConfirmRecruitParticipantsResponse,
  ManagedMeetingRecruit,
  MeetingRecruitDetail,
  MeetingRecruitRequest,
  RecruitParticipantDetail,
  RecruitParticipantsResponse,
  RecruitParticipationResponse,
  RejectParticipantResponse,
  UpdateAttendanceRequest,
  UpdateAttendanceResponse,
} from "@/features/team/types/meetingRecruit.types";
import { fetchClient } from "@/shared/api/fetchClient";

const meetingsEndpoint = "/api/v1/meetings";

function postsEndpoint(meetingId: number) {
  return `${meetingsEndpoint}/${meetingId}/posts`;
}

function recruitEndpoint(meetingId: number, postId: number) {
  return `${postsEndpoint(meetingId)}/${postId}/recruit`;
}

function participantsEndpoint(meetingId: number, postId: number) {
  return `${recruitEndpoint(meetingId, postId)}/participants`;
}

export function createMeetingRecruit(
  meetingId: number,
  request: MeetingRecruitRequest,
) {
  return fetchClient<MeetingRecruitDetail>(
    `${postsEndpoint(meetingId)}/recruits`,
    {
      method: "POST",
      body: JSON.stringify(request),
    },
  );
}

export function updateMeetingRecruit(
  meetingId: number,
  postId: number,
  request: MeetingRecruitRequest,
) {
  return fetchClient<MeetingRecruitDetail>(recruitEndpoint(meetingId, postId), {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export function getMeetingRecruit(meetingId: number, postId: number) {
  return fetchClient<MeetingRecruitDetail>(recruitEndpoint(meetingId, postId));
}

export function toggleMeetingRecruitParticipation(
  meetingId: number,
  postId: number,
) {
  return fetchClient<RecruitParticipationResponse>(
    `${recruitEndpoint(meetingId, postId)}/participation`,
    { method: "POST" },
  );
}

export function getManagedMeetingRecruits(meetingId: number) {
  return fetchClient<ManagedMeetingRecruit[]>(
    `${postsEndpoint(meetingId)}/recruits`,
  );
}

export function getRecruitParticipants(meetingId: number, postId: number) {
  return fetchClient<RecruitParticipantsResponse>(
    participantsEndpoint(meetingId, postId),
  );
}

export function getRecruitParticipant(
  meetingId: number,
  postId: number,
  participationId: number,
) {
  return fetchClient<RecruitParticipantDetail>(
    `${participantsEndpoint(meetingId, postId)}/${participationId}`,
  );
}

export function rejectRecruitParticipant(
  meetingId: number,
  postId: number,
  participationId: number,
) {
  return fetchClient<RejectParticipantResponse>(
    `${participantsEndpoint(meetingId, postId)}/${participationId}/reject`,
    { method: "PATCH" },
  );
}

export function confirmRecruitParticipants(meetingId: number, postId: number) {
  return fetchClient<ConfirmRecruitParticipantsResponse>(
    `${participantsEndpoint(meetingId, postId)}/confirm`,
    { method: "PATCH" },
  );
}

export function updateRecruitAttendance(
  meetingId: number,
  postId: number,
  participationId: number,
  request: UpdateAttendanceRequest,
) {
  return fetchClient<UpdateAttendanceResponse>(
    `${participantsEndpoint(meetingId, postId)}/${participationId}/attendance`,
    { method: "PATCH", body: JSON.stringify(request) },
  );
}
