import { env } from "@/shared/config/env";
import type { UnhandledRequestCallback } from "msw";

const GATHER_API_PATH_PREFIX = "/api/";

export function getGatherApiOrigin() {
  return new URL(env.API_BASE_URL).origin;
}

export function getGatherApiUrl(path: string) {
  return `${getGatherApiOrigin()}${path}`;
}

export function getGatherApiCatchAllPattern() {
  return getGatherApiUrl(`${GATHER_API_PATH_PREFIX}*`);
}

export function isGatherApiRequestUrl(requestUrl: URL) {
  return (
    requestUrl.origin === getGatherApiOrigin() &&
    requestUrl.pathname.startsWith(GATHER_API_PATH_PREFIX)
  );
}

export const handleUnhandledRequest: UnhandledRequestCallback = (
  request,
  print,
) => {
  if (isGatherApiRequestUrl(new URL(request.url))) {
    print.error();
  }
};
