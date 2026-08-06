import { useQuery } from "@tanstack/react-query";

import { getMyBadges, myBadgeKeys } from "@/features/my/api/myBadge.api";

export function useMyBadgesQuery() {
  return useQuery({
    queryKey: myBadgeKeys.all,
    queryFn: getMyBadges,
    refetchOnMount: "always",
  });
}
