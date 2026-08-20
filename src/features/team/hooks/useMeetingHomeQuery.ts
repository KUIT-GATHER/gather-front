import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { teamQueries } from "@/features/team/api/team.queries";

type UseMeetingHomeQueryOptions = {
  enabled?: boolean;
  isAuthenticated?: boolean;
};

export function useMeetingHomeQuery(
  meetingId: number,
  options: UseMeetingHomeQueryOptions = {},
) {
  const query = useQuery({
    ...teamQueries.home(meetingId, options.isAuthenticated ?? false),
    enabled: options.enabled,
  });

  useEffect(() => {
    if (!query.data?.deadline || query.data.status !== "RECRUITING") {
      return;
    }

    const delay = new Date(query.data.deadline).getTime() - Date.now();

    if (delay <= 0) {
      void query.refetch();
      return;
    }

    const timer = window.setTimeout(() => {
      void query.refetch();
    }, delay + 100);

    return () => window.clearTimeout(timer);
  }, [query.data?.deadline, query.data?.status, query.refetch]);

  return query;
}
