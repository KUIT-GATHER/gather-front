import type {
  PostImagePresignedUrlRequest,
  PostImagePresignedUrlResponse,
} from "@/features/team/types/postImage.types";
import { fetchClient } from "@/shared/api/fetchClient";

const MEETING_ENDPOINT = "/api/v1/meetings";

export function requestPostImagePresignedUrl(
  meetingId: number,
  request: PostImagePresignedUrlRequest,
) {
  return fetchClient<PostImagePresignedUrlResponse>(
    `${MEETING_ENDPOINT}/${meetingId}/posts/images/presigned-url`,
    {
      method: "POST",
      body: JSON.stringify(request),
    },
  );
}
