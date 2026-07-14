import { queryOptions } from "@tanstack/react-query";

import { getPostingTeams } from "@/features/team/api/team.api";

export const teamKeys = {
  all: ["teams"] as const,
  postingTeams: (postingId: number) =>
    [...teamKeys.all, "posting", postingId] as const,
};

export const teamQueries = {
  postingTeams: (postingId: number) =>
    queryOptions({
      queryKey: teamKeys.postingTeams(postingId),
      queryFn: () => getPostingTeams(postingId),
    }),
};
