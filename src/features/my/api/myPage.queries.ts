import { queryOptions } from "@tanstack/react-query";

import { getMyPageHome } from "@/features/my/api/myPage.api";

export const myPageKeys = {
  all: ["mypage"] as const,
  home: () => [...myPageKeys.all, "home"] as const,
  activities: (yearMonth: string) =>
    [...myPageKeys.all, "activities", yearMonth] as const,
};

export const myPageQueries = {
  home: () =>
    queryOptions({
      queryKey: myPageKeys.home(),
      queryFn: getMyPageHome,
    }),
};
