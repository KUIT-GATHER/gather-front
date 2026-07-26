import { useQuery } from "@tanstack/react-query";

import { teamQueries } from "@/features/team/api/team.queries";

type UseMyMeetingsQueryOptions = {
  enabled?: boolean;
};

export function useMyMeetingsQuery(options: UseMyMeetingsQueryOptions = {}) {
  return useQuery({
    ...teamQueries.my(),
    enabled: options.enabled,
  });
}
