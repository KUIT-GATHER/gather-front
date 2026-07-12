import { useQuery } from "@tanstack/react-query";

import { regionQueries } from "../api/region.queries";

export function useRegionsQuery() {
  return useQuery(regionQueries.list());
}
