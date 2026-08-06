import { requestPostImagePresignedUrl } from "@/features/team/api/meetingPost.api";

export async function uploadMeetingPostImages(
  meetingId: number,
  files: readonly File[],
) {
  const objectKeys: string[] = [];

  for (const file of files) {
    const presigned = await requestPostImagePresignedUrl(meetingId, {
      contentType: file.type,
      fileSize: file.size,
    });
    const response = await fetch(presigned.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
        "If-None-Match": "*",
      },
      body: file,
      credentials: "omit",
    });

    if (!response.ok) {
      throw new Error("게시글 사진 업로드에 실패했습니다.");
    }

    objectKeys.push(presigned.objectKey);
  }

  return objectKeys;
}
