import { fetchClient } from "@/shared/api/fetchClient";

import type { PostingCategory } from "@/features/category/types/postingCategory.types";
import type {
  MyActivityRecordPage,
  MyActivitySummary,
  MyPageActivity,
} from "@/features/my/types/myActivity.types";

export function getMyActivities(yearMonth: string) {
  const params = new URLSearchParams({ yearMonth });
  return fetchClient<MyPageActivity[]>(
    `/api/v1/mypage/activities?${params.toString()}`,
  );
}

export function getMyActivitySummary() {
  return fetchClient<MyActivitySummary>("/api/v1/mypage/activities/summary");
}

export function getMyActivityRecords(
  page: number,
  category: PostingCategory | null,
) {
  const params = new URLSearchParams({
    page: String(page),
    size: "20",
  });

  if (category) params.set("category", category);

  return fetchClient<MyActivityRecordPage>(
    `/api/v1/mypage/activities/records?${params.toString()}`,
  );
}
