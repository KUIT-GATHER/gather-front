import { fetchClient } from "@/shared/api/fetchClient";

import type {
  MeetingDetail,
  MeetingListItem,
  MeetingListParams,
} from "@/features/team/types/team.types";

const MEETING_ENDPOINT = "/api/v1/meetings";

function buildMeetingsEndpoint(params: MeetingListParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.keyword?.trim()) {
    searchParams.set("keyword", params.keyword.trim());
  }

  if (params.regionId !== undefined) {
    searchParams.set("regionId", String(params.regionId));
  }

  if (params.category) {
    searchParams.set("category", params.category);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  const query = searchParams.toString();

  return query ? `${MEETING_ENDPOINT}?${query}` : MEETING_ENDPOINT;
}

export function getMeetings(params?: MeetingListParams) {
  return fetchClient<MeetingListItem[]>(buildMeetingsEndpoint(params));
}

export function getMeeting(meetingId: number) {
  return fetchClient<MeetingDetail>(`${MEETING_ENDPOINT}/${meetingId}`);
}
