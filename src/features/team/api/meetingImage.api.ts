import { fetchClient } from "@/shared/api/fetchClient";

import type {
  MeetingImageListResponse,
  MeetingImagePresignedUrlRequest,
  MeetingImagePresignedUrlResponse,
  MeetingImageUpdateRequest,
  MeetingImageUpdateResponse,
} from "@/features/team/types/meetingImage.types";

const MEETING_ENDPOINT = "/api/v1/meetings";
const publicOptions = {
  skipAuth: true,
  withCredentials: false,
} as const;

export function requestMeetingImagePresignedUrl(
  meetingId: number,
  request: MeetingImagePresignedUrlRequest,
) {
  return fetchClient<MeetingImagePresignedUrlResponse>(
    `${MEETING_ENDPOINT}/${meetingId}/images/presigned-url`,
    {
      method: "POST",
      body: JSON.stringify(request),
    },
  );
}

export function updateMeetingImages(
  meetingId: number,
  request: MeetingImageUpdateRequest,
) {
  return fetchClient<MeetingImageUpdateResponse>(
    `${MEETING_ENDPOINT}/${meetingId}/images`,
    {
      method: "PATCH",
      body: JSON.stringify(request),
    },
  );
}

export function getMeetingImages(meetingId: number) {
  return fetchClient<MeetingImageListResponse>(
    `${MEETING_ENDPOINT}/${meetingId}/images`,
    publicOptions,
  );
}
