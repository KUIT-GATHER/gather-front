import { delay, HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { server } from "@/mocks/server";
import { ApiError } from "@/shared/api/apiError";

import { fetchClient } from "./fetchClient";

function expiredTokenResponse() {
  return HttpResponse.json(
    {
      success: false,
      data: null,
      error: {
        code: "EXPIRED_TOKEN",
        message: "Access Token이 만료되었습니다.",
      },
    },
    { status: 401 },
  );
}

describe("fetchClient 인증 만료 처리", () => {
  it("EXPIRED_TOKEN이면 reissue 후 원 요청을 한 번 재시도한다", async () => {
    let protectedCalls = 0;
    let reissueCalls = 0;
    let restoreCalls = 0;

    server.use(
      http.get("*/api/v1/test/protected", ({ request }) => {
        protectedCalls += 1;

        if (
          request.headers.get("Authorization") === "Bearer fresh-access-token"
        ) {
          return HttpResponse.json({
            success: true,
            data: { value: "ok" },
            error: null,
          });
        }

        return expiredTokenResponse();
      }),
      http.post("*/api/v1/auth/reissue", () => {
        reissueCalls += 1;

        return HttpResponse.json({
          success: true,
          data: { accessToken: "fresh-access-token", tokenType: "Bearer" },
          error: null,
        });
      }),
      http.post("*/api/v1/auth/session/restore", () => {
        restoreCalls += 1;
        return HttpResponse.json({
          success: true,
          data: {
            authenticated: true,
            accessToken: "unexpected-restore-token",
            tokenType: "Bearer",
          },
          error: null,
        });
      }),
    );

    useAuthStore.setState({
      accessToken: "expired-access-token",
      isAuthenticated: true,
    });

    await expect(
      fetchClient<{ value: string }>("/api/v1/test/protected"),
    ).resolves.toEqual({ value: "ok" });

    expect(protectedCalls).toBe(2);
    expect(reissueCalls).toBe(1);
    expect(restoreCalls).toBe(0);
    expect(useAuthStore.getState().accessToken).toBe("fresh-access-token");
  });

  it("동시에 만료된 요청이 여러 개여도 reissue는 한 번만 호출한다", async () => {
    let protectedCalls = 0;
    let reissueCalls = 0;

    server.use(
      http.get("*/api/v1/test/concurrent", ({ request }) => {
        protectedCalls += 1;

        if (
          request.headers.get("Authorization") === "Bearer fresh-access-token"
        ) {
          return HttpResponse.json({
            success: true,
            data: { value: "ok" },
            error: null,
          });
        }

        return expiredTokenResponse();
      }),
      http.post("*/api/v1/auth/reissue", async () => {
        reissueCalls += 1;
        await delay(20);

        return HttpResponse.json({
          success: true,
          data: { accessToken: "fresh-access-token", tokenType: "Bearer" },
          error: null,
        });
      }),
    );

    useAuthStore.setState({
      accessToken: "expired-access-token",
      isAuthenticated: true,
    });

    await expect(
      Promise.all([
        fetchClient<{ value: string }>("/api/v1/test/concurrent"),
        fetchClient<{ value: string }>("/api/v1/test/concurrent"),
      ]),
    ).resolves.toEqual([{ value: "ok" }, { value: "ok" }]);

    expect(protectedCalls).toBe(4);
    expect(reissueCalls).toBe(1);
  });

  it("skipAuth 요청은 EXPIRED_TOKEN이어도 reissue하지 않는다", async () => {
    let reissueCalls = 0;

    server.use(
      http.post("*/api/v1/test/skip-auth", () => expiredTokenResponse()),
      http.post("*/api/v1/auth/reissue", () => {
        reissueCalls += 1;

        return HttpResponse.json({
          success: true,
          data: { accessToken: "unexpected-token", tokenType: "Bearer" },
          error: null,
        });
      }),
    );

    await expect(
      fetchClient("/api/v1/test/skip-auth", {
        method: "POST",
        skipAuth: true,
        withCredentials: true,
      }),
    ).rejects.toBeInstanceOf(ApiError);

    expect(reissueCalls).toBe(0);
  });
});
