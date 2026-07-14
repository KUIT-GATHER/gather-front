import { HttpResponse, http } from "msw";

import regionGroups from "./data/regionGroups.json";
import regions from "./data/regions.json";

export const regionHandlers = [
  http.get("*/api/v1/regions/groups", () => {
    return HttpResponse.json({
      success: true,
      data: regionGroups,
      error: null,
    });
  }),

  http.get("*/api/v1/regions", () => {
    return HttpResponse.json(regions);
  }),
];
