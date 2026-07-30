import { fetchClient } from "@/shared/api/fetchClient";

import type { MyPageActivity } from "@/features/my/types/myActivity.types";

export function getMyActivities(yearMonth: string) {
  const params = new URLSearchParams({ yearMonth });
  return fetchClient<MyPageActivity[]>(
    `/api/v1/mypage/activities?${params.toString()}`,
  );
}
