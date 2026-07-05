import { HttpResponse, http } from "msw";

import volunteers from "./data/volunteers.json";
import teams from "./data/teams.json";

export const homeHandlers = [
  http.get("*/api/v1/home", () => {
    return HttpResponse.json({
      success: true,
      data: {
        recommendedVolunteers: volunteers.data.slice(0, 5),
        recommendedTeams: teams.data.slice(0, 5),
      },
      error: null,
    });
  }),
];
