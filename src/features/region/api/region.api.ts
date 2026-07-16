import { fetchClient } from "@/shared/api/fetchClient";

import type { Region, RegionGroup } from "../types/region.types";

const publicOptions = {
  skipAuth: true,
  withCredentials: false,
} as const;

export function getRegions() {
  return fetchClient<Region[]>("/api/v1/regions", publicOptions);
}

export function getRegionGroups() {
  return fetchClient<RegionGroup[]>("/api/v1/regions/groups", publicOptions);
}
