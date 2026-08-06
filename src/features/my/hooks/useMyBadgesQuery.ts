import { useQuery } from "@tanstack/react-query";

import { myPageQueries } from "@/features/my/api/myPage.queries";

export function useMyBadgesQuery() {
  return useQuery(myPageQueries.badges());
}
