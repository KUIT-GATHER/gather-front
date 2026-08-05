import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { myPageQueries } from "@/features/my/api/myPage.queries";
import type { PostingCategory } from "@/features/category/types/postingCategory.types";

export function useMyActivitiesQuery(yearMonth: string) {
  return useQuery(myPageQueries.activities(yearMonth));
}

export function useMyActivitySummaryQuery() {
  return useQuery(myPageQueries.activitySummary());
}

export function useMyActivityRecordsQuery(category: PostingCategory | null) {
  return useInfiniteQuery(myPageQueries.activityRecords(category));
}
