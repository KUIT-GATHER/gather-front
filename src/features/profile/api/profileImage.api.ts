import { fetchClient } from "@/shared/api/fetchClient";

import type {
  ProfileImage,
  ProfileImagePresignedUrlRequest,
  ProfileImagePresignedUrlResponse,
} from "@/features/profile/types/profileImage.types";

const PROFILE_IMAGE_ENDPOINT = "/api/v1/users/me/profile-image";

export function getProfileImage() {
  return fetchClient<ProfileImage>(PROFILE_IMAGE_ENDPOINT);
}

export function requestProfileImagePresignedUrl(
  request: ProfileImagePresignedUrlRequest,
) {
  return fetchClient<ProfileImagePresignedUrlResponse>(
    `${PROFILE_IMAGE_ENDPOINT}/presigned-url`,
    {
      method: "POST",
      body: JSON.stringify(request),
    },
  );
}

export function applyProfileImage(objectKey: string) {
  return fetchClient<ProfileImage>(PROFILE_IMAGE_ENDPOINT, {
    method: "PATCH",
    body: JSON.stringify({ objectKey }),
  });
}
