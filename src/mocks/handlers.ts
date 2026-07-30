import { postingHandlers } from "./postingHandlers";
import { authHandlers } from "./authHandlers";
import { regionHandlers } from "./regionHandlers";
import { teamHandlers } from "./teamHandlers";
import { myProfileHandlers } from "./myProfileHandlers";

export const handlers = [
  ...postingHandlers,
  ...authHandlers,
  ...regionHandlers,
  ...teamHandlers,
  ...myProfileHandlers,
];
