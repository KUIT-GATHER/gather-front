import { requestPostImagePresignedUrl } from "@/features/team/api/postImage.api";

async function uploadPostImage(meetingId: number, file: File) {
  let retriesRemaining = 1;

  while (true) {
    console.log("업로드할 이미지 정보:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    const { uploadUrl, objectKey, expiresInSeconds } =
      await requestPostImagePresignedUrl(meetingId, {
        contentType: file.type,
        fileSize: file.size,
      });

    console.log("Presigned URL 발급 결과:", {
      objectKey,
      expiresInSeconds,
    });

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
    } catch (error) {
      console.error("S3 연결 실패:", error);
      throw new Error("이미지 저장 서버와 연결하지 못했습니다.");
    }

    if (response.ok) {
      console.log("이미지 업로드 성공:", {
        objectKey,
        status: response.status,
      });

      return objectKey;
    }

    const errorResponse = await response.text().catch(() => "");

    console.error("S3 이미지 업로드 실패:", {
      status: response.status,
      statusText: response.statusText,
      objectKey,
      response: errorResponse,
    });

    if (response.status === 412 && retriesRemaining > 0) {
      retriesRemaining -= 1;

      console.warn("이미지 키 충돌로 Presigned URL을 다시 발급합니다.", {
        retriesRemaining,
      });

      continue;
    }

    throw new Error(
      errorResponse
        ? `이미지 업로드 실패: ${response.status}\n${errorResponse}`
        : `이미지 업로드 실패: ${response.status}`,
    );
  }
}

export async function uploadPostImages(
  meetingId: number,
  files: File[],
): Promise<string[]> {
  const objectKeys: string[] = [];

  // 선택한 이미지 순서를 유지하기 위해 순차 업로드
  for (const file of files) {
    const objectKey = await uploadPostImage(meetingId, file);
    objectKeys.push(objectKey);
  }

  console.log("전체 이미지 업로드 완료:", objectKeys);

  return objectKeys;
}
