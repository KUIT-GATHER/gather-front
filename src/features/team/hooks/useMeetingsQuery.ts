import { useQuery } from "@tanstack/react-query";

import { teamQueries } from "../api/team.queries";
import type { MeetingListParams } from "../types/team.types";

export function useMeetingsQuery(params: MeetingListParams = {}) {
  return useQuery(teamQueries.list(params));
}
