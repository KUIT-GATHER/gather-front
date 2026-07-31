import { postingHandlers } from "./postingHandlers";
import { authHandlers } from "./authHandlers";
import { notificationHandlers } from "./notificationHandlers";
import { regionHandlers } from "./regionHandlers";
import { teamHandlers } from "./teamHandlers";

export const handlers = [
  ...postingHandlers,
  ...authHandlers,
  ...notificationHandlers,
  ...regionHandlers,
  ...teamHandlers,
];
