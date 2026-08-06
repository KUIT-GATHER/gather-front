import { fetchClient } from "@/shared/api/fetchClient";

import type { MyBadge } from "@/features/my/types/myBadge.types";

export function getMyBadges() {
  return fetchClient<MyBadge[]>("/api/v1/mypage/badges");
}
