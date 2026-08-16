import { HttpResponse, http } from "msw";

import { getGatherApiCatchAllPattern } from "./apiScope";
import { postingHandlers } from "./postingHandlers";
import { authHandlers } from "./authHandlers";
import { notificationHandlers } from "./notificationHandlers";
import { regionHandlers } from "./regionHandlers";
import { teamHandlers } from "./teamHandlers";
import { badgeHandlers } from "./badgeHandlers";
import { myProfileHandlers } from "./myProfileHandlers";
import { meetingManagementHandlers } from "./meetingManagementHandlers";

export const handlers = [
  ...postingHandlers,
  ...authHandlers,
  ...notificationHandlers,
  ...regionHandlers,
  ...meetingManagementHandlers,
  ...teamHandlers,
  ...myProfileHandlers,
  ...badgeHandlers,
  http.all(getGatherApiCatchAllPattern(), ({ request }) => {
    console.error(
      `[MSW] Unhandled API request: ${request.method} ${request.url}`,
    );

    return HttpResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: "MSW_HANDLER_NOT_FOUND",
          message: "등록되지 않은 MSW API 요청입니다.",
        },
      },
      { status: 501 },
    );
  }),
];
