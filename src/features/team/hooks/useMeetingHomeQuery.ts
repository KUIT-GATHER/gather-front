import { useQuery } from "@tanstack/react-query";

import { teamQueries } from "@/features/team/api/team.queries";

export function useMeetingHomeQuery(meetingId: number) {
  return useQuery(teamQueries.home(meetingId));
}
