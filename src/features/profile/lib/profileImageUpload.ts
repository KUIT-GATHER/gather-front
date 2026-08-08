import {
  applyProfileImage,
  requestProfileImagePresignedUrl,
} from "@/features/profile/api/profileImage.api";

export const PROFILE_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

const PROFILE_IMAGE_TYPES = new Set(PROFILE_IMAGE_ACCEPT.split(","));
const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;

export class ProfileImageUploadError extends Error {
  public status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ProfileImageUploadError";
    this.status = status;
  }
}

export function getProfileImageValidationError(file: File) {
  if (!PROFILE_IMAGE_TYPES.has(file.type)) {
    return "JPEG, PNG, WebP 이미지만 사용할 수 있어요.";
  }
  if (file.size <= 0) {
    return "비어 있는 이미지 파일은 사용할 수 없어요.";
  }
  if (file.size > MAX_PROFILE_IMAGE_SIZE) {
    return "프로필 이미지는 5MB 이하여야 해요.";
  }
  return null;
}

async function putProfileImage(uploadUrl: string, file: File) {
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
    throw new ProfileImageUploadError(
      "이미지 저장소에 연결하지 못했어요. 다시 시도해 주세요.",
    );
  }

  if (!response.ok) {
    throw new ProfileImageUploadError(
      "프로필 이미지 업로드에 실패했어요.",
      response.status,
    );
  }
}

export async function uploadProfileImage(file: File) {
  const validationError = getProfileImageValidationError(file);
  if (validationError) throw new ProfileImageUploadError(validationError);

  let retriesRemaining = 1;

  while (true) {
    const presigned = await requestProfileImagePresignedUrl({
      contentType: file.type,
      fileSize: file.size,
    });

    try {
      await putProfileImage(presigned.uploadUrl, file);
      return await applyProfileImage(presigned.objectKey);
    } catch (error) {
      if (
        error instanceof ProfileImageUploadError &&
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
