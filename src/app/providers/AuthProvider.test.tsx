import { render, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { afterEach, describe, expect, it } from "vitest";

import { AuthProvider } from "@/app/providers/AuthProvider";
import { KAKAO_CALLBACK_PATH } from "@/features/auth/lib/kakaoOAuth";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { server } from "@/mocks/server";

const sessionRestoreEndpoint = "*/api/v1/auth/session/restore";

function renderAuthProvider() {
  return render(
    <AuthProvider>
      <span>앱 콘텐츠</span>
    </AuthProvider>,
  );
}

describe("AuthProvider", () => {
  afterEach(() => {
    window.history.replaceState({}, "", "/");
  });

  it("세션이 없으면 anonymous 상태로 초기화하고 reissue를 호출하지 않는다", async () => {
    let restoreCalls = 0;
    let reissueCalls = 0;
    let authorizationHeader: string | null = null;
    let requestCredentials: RequestCredentials | undefined;

    server.use(
      http.post(sessionRestoreEndpoint, ({ request }) => {
        restoreCalls += 1;
        authorizationHeader = request.headers.get("Authorization");
        requestCredentials = request.credentials;

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
      http.post("*/api/v1/auth/reissue", () => {
        reissueCalls += 1;

        return HttpResponse.json({
          success: true,
          data: { accessToken: "unexpected-token", tokenType: "Bearer" },
          error: null,
        });
      }),
    );

    useAuthStore.setState({
      accessToken: "stale-access-token",
      isAuthenticated: true,
      authInitialized: false,
    });

    renderAuthProvider();

    await waitFor(() => {
      expect(useAuthStore.getState().authInitialized).toBe(true);
    });

    expect(restoreCalls).toBe(1);
    expect(reissueCalls).toBe(0);
    expect(authorizationHeader).toBeNull();
    expect(requestCredentials).toBe("include");
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      isAuthenticated: false,
    });
  });

  it("복원된 세션의 Access Token을 저장한다", async () => {
    server.use(
      http.post(sessionRestoreEndpoint, () =>
        HttpResponse.json({
          success: true,
          data: {
            authenticated: true,
            accessToken: "restored-access-token",
            tokenType: "Bearer",
          },
          error: null,
        }),
      ),
    );

    renderAuthProvider();

    await waitFor(() => {
      expect(useAuthStore.getState()).toMatchObject({
        accessToken: "restored-access-token",
        isAuthenticated: true,
        authInitialized: true,
      });
    });
  });

  it("session restore 서버 오류에서도 초기화를 완료하고 reissue를 호출하지 않는다", async () => {
    let reissueCalls = 0;

    server.use(
      http.post(sessionRestoreEndpoint, () =>
        HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "INTERNAL_SERVER_ERROR",
              message: "서버 오류",
            },
          },
          { status: 503 },
        ),
      ),
      http.post("*/api/v1/auth/reissue", () => {
        reissueCalls += 1;

        return HttpResponse.json({
          success: true,
          data: { accessToken: "unexpected-token", tokenType: "Bearer" },
          error: null,
        });
      }),
    );

    useAuthStore.setState({
      accessToken: "stale-access-token",
      isAuthenticated: true,
      authInitialized: false,
    });

    renderAuthProvider();

    await waitFor(() => {
      expect(useAuthStore.getState().authInitialized).toBe(true);
    });

    expect(reissueCalls).toBe(0);
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      isAuthenticated: false,
    });
  });

  it("Kakao OAuth callback에서는 session restore를 생략한다", async () => {
    let restoreCalls = 0;

    window.history.replaceState({}, "", KAKAO_CALLBACK_PATH);

    server.use(
      http.post(sessionRestoreEndpoint, () => {
        restoreCalls += 1;

        return HttpResponse.json({
          success: true,
          data: {
            authenticated: true,
            accessToken: "unexpected-token",
            tokenType: "Bearer",
          },
          error: null,
        });
      }),
    );

    useAuthStore.setState({
      accessToken: "oauth-access-token",
      isAuthenticated: true,
      authInitialized: false,
    });

    renderAuthProvider();

    await waitFor(() => {
      expect(useAuthStore.getState().authInitialized).toBe(true);
    });

    expect(restoreCalls).toBe(0);
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: "oauth-access-token",
      isAuthenticated: true,
    });
  });
});
