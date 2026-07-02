import { HttpResponse, http } from "msw";

import regions from "./data/regions.json";

export const regionHandlers = [
  http.get("*/api/v1/regions", () => {
    return HttpResponse.json(regions);
  }),
];
