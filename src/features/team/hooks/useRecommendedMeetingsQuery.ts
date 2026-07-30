import { useQuery } from "@tanstack/react-query";

import { teamQueries } from "../api/team.queries";

export function useRecommendedMeetingsQuery() {
  return useQuery(teamQueries.recommended());
}
