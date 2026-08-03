import { queryOptions } from "@tanstack/react-query";

import { getMyPageHome } from "@/features/my/api/myPage.api";

export const myPageKeys = {
  all: ["mypage"] as const,
  home: () => [...myPageKeys.all, "home"] as const,
  activitiesAll: () => [...myPageKeys.all, "activities"] as const,
  activities: (yearMonth: string) =>
    [...myPageKeys.activitiesAll(), yearMonth] as const,
};

export const myPageQueries = {
  home: () =>
    queryOptions({
      queryKey: myPageKeys.home(),
      queryFn: getMyPageHome,
    }),
};
