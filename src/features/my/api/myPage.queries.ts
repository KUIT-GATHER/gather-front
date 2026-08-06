import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import {
  getMyActivities,
  getMyActivityRecords,
  getMyActivitySummary,
} from "@/features/my/api/myActivity.api";
import { getMyBadges } from "@/features/my/api/myBadge.api";
import { getMyPageHome } from "@/features/my/api/myPage.api";
import type { PostingCategory } from "@/features/category/types/postingCategory.types";

export const myPageKeys = {
  all: ["mypage"] as const,
  home: () => [...myPageKeys.all, "home"] as const,
  badges: () => [...myPageKeys.all, "badges"] as const,
  activitiesAll: () => [...myPageKeys.all, "activities"] as const,
  activities: (yearMonth: string) =>
    [...myPageKeys.activitiesAll(), yearMonth] as const,
  activitySummary: () => [...myPageKeys.activitiesAll(), "summary"] as const,
  activityRecords: (category: string | null) =>
    [...myPageKeys.activitiesAll(), "records", category] as const,
};

export const myPageQueries = {
  home: () =>
    queryOptions({
      queryKey: myPageKeys.home(),
      queryFn: getMyPageHome,
    }),
  badges: () =>
    queryOptions({
      queryKey: myPageKeys.badges(),
      queryFn: getMyBadges,
      refetchOnMount: "always",
    }),
  activities: (yearMonth: string) =>
    queryOptions({
      queryKey: myPageKeys.activities(yearMonth),
      queryFn: () => getMyActivities(yearMonth),
    }),
  activitySummary: () =>
    queryOptions({
      queryKey: myPageKeys.activitySummary(),
      queryFn: getMyActivitySummary,
    }),
  activityRecords: (category: PostingCategory | null) =>
    infiniteQueryOptions({
      queryKey: myPageKeys.activityRecords(category),
      initialPageParam: 0,
      queryFn: ({ pageParam }) => getMyActivityRecords(pageParam, category),
      getNextPageParam: (lastPage) => {
        const nextPage = lastPage.page + 1;
        return nextPage < lastPage.totalPages ? nextPage : undefined;
      },
    }),
};
