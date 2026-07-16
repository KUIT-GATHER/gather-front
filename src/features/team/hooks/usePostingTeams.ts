import { useQuery } from "@tanstack/react-query";

import { teamQueries } from "@/features/team/api/team.queries";

export function usePostingTeams(postingId: number) {
  return useQuery(teamQueries.postingTeams(postingId));
}
