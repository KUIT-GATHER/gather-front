import { fetchClient } from "@/shared/api/fetchClient";

import type { ChangeMyPasswordRequest } from "../types/myAccount.types";

const MY_PASSWORD_ENDPOINT = "/api/v1/users/me/password";

export function changeMyPassword(request: ChangeMyPasswordRequest) {
  return fetchClient<null>(MY_PASSWORD_ENDPOINT, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}
