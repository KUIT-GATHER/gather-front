import type {
  MeetingPostCreateRequest,
  MeetingPostUpdateRequest,
  PostImagePresignedUrlRequest,
  PostImagePresignedUrlResponse,
  ReviewableActivity,
} from "@/features/team/types/meetingPost.types";
import type { MeetingPost } from "@/features/team/types/team.types";
import { fetchClient } from "@/shared/api/fetchClient";

const meetingsEndpoint = "/api/v1/meetings";

export function createMeetingPost(
  meetingId: number,
  request: MeetingPostCreateRequest,
) {
  return fetchClient<MeetingPost>(`${meetingsEndpoint}/${meetingId}/posts`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function updateMeetingPost(
  meetingId: number,
  postId: number,
  request: MeetingPostUpdateRequest,
) {
  return fetchClient<MeetingPost>(
    `${meetingsEndpoint}/${meetingId}/posts/${postId}`,
    { method: "PATCH", body: JSON.stringify(request) },
  );
}

export function getReviewableActivities(meetingId: number) {
  return fetchClient<ReviewableActivity[]>(
    `${meetingsEndpoint}/${meetingId}/my/reviewable-activities`,
  );
}

export function requestPostImagePresignedUrl(
  meetingId: number,
  request: PostImagePresignedUrlRequest,
) {
  return fetchClient<PostImagePresignedUrlResponse>(
    `${meetingsEndpoint}/${meetingId}/posts/images/presigned-url`,
    { method: "POST", body: JSON.stringify(request) },
  );
}
