import { volunteerHandlers } from "./volunteerHandlers";
import { authHandlers } from "./authHandlers";
import { categoryHandlers } from "./categoryHandlers";
import { regionHandlers } from "./regionHandlers";
import { teamHandlers } from "./teamHandlers";
import { homeHandlers } from "./homeHandlers";

export const handlers = [
  ...volunteerHandlers,
  ...authHandlers,
  ...regionHandlers,
  ...categoryHandlers,
  ...teamHandlers,
  ...homeHandlers,
];
