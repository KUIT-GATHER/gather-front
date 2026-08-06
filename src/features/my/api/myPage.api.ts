import { fetchClient } from "@/shared/api/fetchClient";

import type { MyPageHome } from "@/features/my/types/myProfile.types";

export function getMyPageHome() {
  return fetchClient<MyPageHome>("/api/v1/mypage/home");
}
