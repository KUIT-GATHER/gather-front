import { requestPostImagePresignedUrl } from "@/features/team/api/meetingPost.api";
import {
  MeetingImageStorageError,
  putMeetingImageToS3,
} from "@/features/team/lib/meetingImageUpload";

export async function uploadMeetingPostImages(
  meetingId: number,
  files: readonly File[],
) {
  const objectKeys: string[] = [];

  for (const file of files) {
    let retriesRemaining = 1;

    while (true) {
      const presigned = await requestPostImagePresignedUrl(meetingId, {
        contentType: file.type,
        fileSize: file.size,
      });

      try {
        await putMeetingImageToS3({ uploadUrl: presigned.uploadUrl, file });
        objectKeys.push(presigned.objectKey);
        break;
      } catch (error) {
        if (
          error instanceof MeetingImageStorageError &&
          error.status === 412 &&
          retriesRemaining > 0
        ) {
          retriesRemaining -= 1;
          continue;
        }

        throw error;
      }
    }
  }

  return objectKeys;
}
