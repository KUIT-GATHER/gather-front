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

  it("reissue가 실패하면 세션을 정리하고 원 요청을 재시도하지 않는다", async () => {
    let protectedCalls = 0;
    let reissueCalls = 0;

    server.use(
      http.get("*/api/v1/test/reissue-failure", () => {
        protectedCalls += 1;
        return expiredTokenResponse();
      }),
      http.post("*/api/v1/auth/reissue", () => {
        reissueCalls += 1;
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "UNAUTHORIZED",
              message: "Refresh Token이 유효하지 않습니다.",
            },
          },
          { status: 401 },
        );
      }),
    );

    useAuthStore.setState({
      accessToken: "expired-access-token",
      isAuthenticated: true,
    });

    await expect(
      fetchClient("/api/v1/test/reissue-failure"),
    ).rejects.toMatchObject({ code: "EXPIRED_TOKEN" });

    expect(protectedCalls).toBe(1);
    expect(reissueCalls).toBe(1);
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      isAuthenticated: false,
    });
  });

  it("refresh 후 재시도 요청이 다시 401이어도 재issue하지 않는다", async () => {
    let protectedCalls = 0;
    let reissueCalls = 0;

    server.use(
      http.get("*/api/v1/test/retry-failure", () => {
        protectedCalls += 1;
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
    );

    useAuthStore.setState({
      accessToken: "expired-access-token",
      isAuthenticated: true,
    });

    await expect(
      fetchClient("/api/v1/test/retry-failure"),
    ).rejects.toMatchObject({ code: "EXPIRED_TOKEN" });

    expect(protectedCalls).toBe(2);
    expect(reissueCalls).toBe(1);
  });

  it.each(["UNAUTHORIZED", "INVALID_TOKEN", "REVOKED_TOKEN"])(
    "refresh 후 retry가 %s이면 인증 세션을 정리한다",
    async (code) => {
      let protectedCalls = 0;
      let reissueCalls = 0;
      const authorizationHeaders: string[] = [];

      server.use(
        http.get("*/api/v1/test/retry-session-clear", ({ request }) => {
          protectedCalls += 1;
          authorizationHeaders.push(request.headers.get("Authorization") ?? "");

          if (protectedCalls === 1) {
            return expiredTokenResponse();
          }

          return HttpResponse.json(
            {
              success: false,
              data: null,
              error: { code, message: "인증이 필요합니다." },
            },
            { status: 401 },
          );
        }),
        http.post("*/api/v1/auth/reissue", () => {
          reissueCalls += 1;

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
        fetchClient("/api/v1/test/retry-session-clear"),
      ).rejects.toMatchObject({ code });

      expect(protectedCalls).toBe(2);
      expect(reissueCalls).toBe(1);
      expect(authorizationHeaders).toEqual([
        "Bearer expired-access-token",
        "Bearer fresh-access-token",
      ]);
      expect(useAuthStore.getState()).toMatchObject({
        accessToken: null,
        isAuthenticated: false,
      });
    },
  );

  it.each(["UNAUTHORIZED", "INVALID_TOKEN", "REVOKED_TOKEN"])(
    "%s 응답이면 인증 세션을 정리한다",
    async (code) => {
      server.use(
        http.get("*/api/v1/test/session-clear", () =>
          HttpResponse.json(
            {
              success: false,
              data: null,
              error: { code, message: "인증이 필요합니다." },
            },
            { status: 401 },
          ),
        ),
      );

      useAuthStore.setState({
        accessToken: "access-token",
        isAuthenticated: true,
      });

      await expect(
        fetchClient("/api/v1/test/session-clear"),
      ).rejects.toBeInstanceOf(ApiError);

      expect(useAuthStore.getState()).toMatchObject({
        accessToken: null,
        isAuthenticated: false,
      });
    },
  );
});
