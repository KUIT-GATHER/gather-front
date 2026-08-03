import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  getMyActivities,
  getMyActivityRecords,
  getMyActivitySummary,
} from "@/features/my/api/myActivity.api";
import { myPageKeys } from "@/features/my/api/myPage.queries";
import type { PostingCategory } from "@/features/category/types/postingCategory.types";

export function useMyActivitiesQuery(yearMonth: string) {
  return useQuery({
    queryKey: myPageKeys.activities(yearMonth),
    queryFn: () => getMyActivities(yearMonth),
  });
}

export function useMyActivitySummaryQuery() {
  return useQuery({
    queryKey: myPageKeys.activitySummary(),
    queryFn: getMyActivitySummary,
  });
}

export function useMyActivityRecordsQuery(category: PostingCategory | null) {
  return useInfiniteQuery({
    queryKey: myPageKeys.activityRecords(category),
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getMyActivityRecords(pageParam, category),
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
  });
}
