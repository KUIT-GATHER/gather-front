import { fetchClient } from "@/shared/api/fetchClient";

import type {
  MyProfile,
  MyProfileImage,
  ProfileImagePresignedUrlRequest,
  ProfileImagePresignedUrlResponse,
  UpdateMyProfileRequest,
} from "../types/myProfile.types";

const MY_PROFILE_ENDPOINT = "/api/v1/users/me";
const PROFILE_IMAGE_ENDPOINT = `${MY_PROFILE_ENDPOINT}/profile-image`;

export function getMyProfile() {
  return fetchClient<MyProfile>(MY_PROFILE_ENDPOINT);
}

export function updateMyProfile(request: UpdateMyProfileRequest) {
  return fetchClient<MyProfile>(MY_PROFILE_ENDPOINT, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export function getMyProfileImage() {
  return fetchClient<MyProfileImage>(PROFILE_IMAGE_ENDPOINT);
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
  return fetchClient<MyProfileImage>(PROFILE_IMAGE_ENDPOINT, {
    method: "PATCH",
    body: JSON.stringify({ objectKey }),
  });
}
