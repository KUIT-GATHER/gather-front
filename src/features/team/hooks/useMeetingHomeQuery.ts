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

  const { data, refetch } = query;

  useEffect(() => {
    if (!data?.deadline || data.status !== "RECRUITING") {
      return;
    }

    const delay = new Date(`${data.deadline}Z`).getTime() - Date.now();

    if (delay <= 0) {
      void refetch();
      return;
    }

    const timer = window.setTimeout(() => {
      void refetch();
    }, delay + 100);

    return () => window.clearTimeout(timer);
  }, [data?.deadline, data?.status, refetch]);

  return query;
}
