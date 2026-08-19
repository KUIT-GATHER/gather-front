import { delay, HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { restoreSessionOnce } from "@/features/auth/lib/restoreSession";
import { server } from "@/mocks/server";

describe("restoreSessionOnce", () => {
  it("동시에 시작된 bootstrap 요청을 하나의 요청으로 합친다", async () => {
    let restoreCalls = 0;

    server.use(
      http.post("*/api/v1/auth/session/restore", async () => {
        restoreCalls += 1;
        await delay(20);

        return HttpResponse.json({
          success: true,
          data: {
            authenticated: false,
            accessToken: null,
            tokenType: null,
          },
          error: null,
        });
      }),
    );

    const firstRestore = restoreSessionOnce();
    const secondRestore = restoreSessionOnce();
    const [firstSession, secondSession] = await Promise.all([
      firstRestore,
      secondRestore,
    ]);

    expect(restoreCalls).toBe(1);
    expect(firstSession).toBe(secondSession);
    expect(firstSession).toEqual({
      authenticated: false,
      accessToken: null,
      tokenType: null,
    });
  });
});
