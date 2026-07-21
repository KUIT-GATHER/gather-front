import { useQuery } from "@tanstack/react-query";

import { regionQueries } from "../api/region.queries";

export function useRegionsQuery(enabled = true) {
  return useQuery({
    ...regionQueries.list(),
    enabled,
  });
}
