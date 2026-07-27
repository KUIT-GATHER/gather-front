import { fetchClient } from "@/shared/api/fetchClient";

import type { Region } from "../types/region.types";

const publicOptions = {
  skipAuth: true,
  withCredentials: false,
} as const;

export function getRegions() {
  return fetchClient<Region[]>("/api/v1/regions", publicOptions);
}
