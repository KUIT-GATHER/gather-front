import { useQuery } from "@tanstack/react-query";

import { regionQueries } from "../api/region.queries";

export function useRegionGroupsQuery() {
  return useQuery(regionQueries.groups());
}
