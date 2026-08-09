import { fetchClient } from "@/shared/api/fetchClient";

import type {
  MyProfile,
  UpdateMyProfileRequest,
} from "../types/myProfile.types";

const MY_PROFILE_ENDPOINT = "/api/v1/users/me";

export function getMyProfile() {
  return fetchClient<MyProfile>(MY_PROFILE_ENDPOINT);
}

export function updateMyProfile(request: UpdateMyProfileRequest) {
  return fetchClient<MyProfile>(MY_PROFILE_ENDPOINT, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}
