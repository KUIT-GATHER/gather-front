import { requestPostImagePresignedUrl } from "@/features/team/api/meetingPost.api";

async function uploadMeetingPostImage(meetingId: number, file: File) {
  let retriesRemaining = 1;

  while (true) {
    const { uploadUrl, objectKey } = await requestPostImagePresignedUrl(
      meetingId,
      {
        contentType: file.type,
        fileSize: file.size,
      },
    );

    let response: Response;

    try {
      response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          "If-None-Match": "*",
        },
        body: file,
        credentials: "omit",
      });
    } catch {
      throw new Error("이미지 저장 서버와 연결하지 못했습니다.");
    }

    if (response.ok) {
      return objectKey;
    }

    if (response.status === 412 && retriesRemaining > 0) {
      retriesRemaining -= 1;
      continue;
    }

    throw new Error("게시글 사진 업로드에 실패했습니다.");
  }
}

export async function uploadMeetingPostImages(
  meetingId: number,
  files: readonly File[],
): Promise<string[]> {
  const objectKeys: string[] = [];

  for (const file of files) {
    const objectKey = await uploadMeetingPostImage(meetingId, file);
    objectKeys.push(objectKey);
  }

  return objectKeys;
}
