import { postingHandlers } from "./postingHandlers";
import { authHandlers } from "./authHandlers";
import { regionHandlers } from "./regionHandlers";
import { teamHandlers } from "./teamHandlers";

export const handlers = [
  ...postingHandlers,
  ...authHandlers,
  ...regionHandlers,
  ...teamHandlers,
];
