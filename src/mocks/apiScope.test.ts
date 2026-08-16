import { describe, expect, it, vi } from "vitest";

import {
  getGatherApiOrigin,
  getGatherApiUrl,
  handleUnhandledRequest,
  isGatherApiRequestUrl,
} from "@/mocks/apiScope";
import { fetchClient } from "@/shared/api/fetchClient";

describe("MSW Gather API scope", () => {
  it("API_BASE_URL origin의 /api 경로만 Gather API로 판단한다", () => {
    const origin = getGatherApiOrigin();

    expect(
      isGatherApiRequestUrl(new URL(getGatherApiUrl("/api/v1/test"))),
    ).toBe(true);
    expect(isGatherApiRequestUrl(new URL(`${origin}/not-api/test`))).toBe(
      false,
    );
    expect(
      isGatherApiRequestUrl(
        new URL("https://developers.kakao.com/api/v1/test"),
      ),
    ).toBe(false);
  });

  it("Gather API unhandled request에는 error 전략을 적용한다", () => {
    const print = {
      warning: vi.fn(),
      error: vi.fn(),
    };

    handleUnhandledRequest(
      new Request(getGatherApiUrl("/api/v1/unhandled")),
      print,
    );

    expect(print.error).toHaveBeenCalledOnce();
    expect(print.warning).not.toHaveBeenCalled();
  });

  it("Gather 외부 request는 bypass 대상으로 둔다", () => {
    const print = {
      warning: vi.fn(),
      error: vi.fn(),
    };

    handleUnhandledRequest(
      new Request("https://dapi.kakao.com/v2/local/search/address.json"),
      print,
    );

    expect(print.error).not.toHaveBeenCalled();
    expect(print.warning).not.toHaveBeenCalled();
  });

  it("등록되지 않은 Gather API는 실제 backend 대신 501 catch-all로 끝난다", async () => {
    await expect(
      fetchClient("/api/v1/unregistered-msw-endpoint", {
        skipAuth: true,
      }),
    ).rejects.toMatchObject({
      status: 501,
      code: "MSW_HANDLER_NOT_FOUND",
    });
  });
});
