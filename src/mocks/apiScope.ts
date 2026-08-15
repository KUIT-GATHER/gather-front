import { env } from "@/shared/config/env";

const GATHER_API_PATH_PREFIX = "/api/";

export function getGatherApiOrigin() {
  return new URL(env.API_BASE_URL).origin;
}

export function getGatherApiCatchAllPattern() {
  return `${getGatherApiOrigin()}${GATHER_API_PATH_PREFIX}*`;
}

export function isGatherApiRequestUrl(requestUrl: URL) {
  return (
    requestUrl.origin === getGatherApiOrigin() &&
    requestUrl.pathname.startsWith(GATHER_API_PATH_PREFIX)
  );
}
