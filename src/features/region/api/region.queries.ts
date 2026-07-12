import { queryOptions } from "@tanstack/react-query";

import { getRegions } from "./region.api";

const REGION_STALE_TIME = 30 * 60 * 1000;
const REGION_GC_TIME = 60 * 60 * 1000;

export const regionKeys = {
  all: ["regions"] as const,
  list: () => [...regionKeys.all, "list"] as const,
};

export const regionQueries = {
  list: () =>
    queryOptions({
      queryKey: regionKeys.list(),
      queryFn: getRegions,
      staleTime: REGION_STALE_TIME,
      gcTime: REGION_GC_TIME,
    }),
};
