import { queryOptions } from "@tanstack/react-query";

import { getMyPageHome } from "@/features/my/api/myPage.api";

export const myPageKeys = {
  all: ["mypage"] as const,
  home: () => [...myPageKeys.all, "home"] as const,
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
};
