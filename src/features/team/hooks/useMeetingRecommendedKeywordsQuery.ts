import { useQuery } from "@tanstack/react-query";

import { teamQueries } from "@/features/team/api/team.queries";

export function useMeetingRecommendedKeywordsQuery() {
  return useQuery(teamQueries.recommendedKeywords());
}
