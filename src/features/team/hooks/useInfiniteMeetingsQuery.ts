import { useInfiniteQuery } from "@tanstack/react-query";

import { teamQueries } from "../api/team.queries";
import type { MeetingInfiniteParams } from "../types/team.types";

export function useInfiniteMeetingsQuery(params: MeetingInfiniteParams = {}) {
  return useInfiniteQuery(teamQueries.infiniteList(params));
}
