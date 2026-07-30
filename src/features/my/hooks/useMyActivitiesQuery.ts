import { useQuery } from "@tanstack/react-query";

import { getMyActivities } from "@/features/my/api/myActivity.api";
import { myPageKeys } from "@/features/my/api/myPage.queries";

export function useMyActivitiesQuery(yearMonth: string) {
  return useQuery({
    queryKey: myPageKeys.activities(yearMonth),
    queryFn: () => getMyActivities(yearMonth),
  });
}
