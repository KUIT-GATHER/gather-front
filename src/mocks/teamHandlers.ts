import { HttpResponse, http } from "msw";

import teams from "./data/teams.json";

export const teamHandlers = [
  http.get("*/api/v1/teams", () => {
    return HttpResponse.json(teams);
  }),
];
