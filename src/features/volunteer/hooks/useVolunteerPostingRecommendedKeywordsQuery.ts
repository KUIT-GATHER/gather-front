import { useQuery } from "@tanstack/react-query";

import { volunteerPostingQueries } from "../api/volunteer.queries";

export function useVolunteerPostingRecommendedKeywordsQuery() {
  return useQuery(volunteerPostingQueries.recommendedKeywords());
}
