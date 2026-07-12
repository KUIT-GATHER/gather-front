import { useQuery } from "@tanstack/react-query";

import { getRegions } from "../api/region.api";

export const regionQueryKeys = {
  all: ["regions"] as const,
  list: () => [...regionQueryKeys.all, "list"] as const,
};

export function useRegionsQuery() {
  return useQuery({
    queryKey: regionQueryKeys.list(),
    queryFn: getRegions,
  });
}
