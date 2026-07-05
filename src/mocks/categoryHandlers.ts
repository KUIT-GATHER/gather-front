import { HttpResponse, http } from "msw";

import categories from "./data/categories.json";

export const categoryHandlers = [
  http.get("*/api/v1/categories", () => {
    return HttpResponse.json(categories);
  }),
];
