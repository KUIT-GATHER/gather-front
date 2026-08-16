import { HttpResponse, http } from "msw";

import regions from "./data/regions.json";
import { getGatherApiUrl } from "./apiScope";

export const regionHandlers = [
  http.get(getGatherApiUrl("/api/v1/regions"), () => {
    return HttpResponse.json(regions);
  }),
];
