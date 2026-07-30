import { useQuery } from "@tanstack/react-query";

import { volunteerPostingQueries } from "../api/volunteer.queries";

export function useRecommendedVolunteerPostingsQuery() {
  return useQuery(volunteerPostingQueries.recommended());
}
