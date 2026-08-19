import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import { RequireAuth } from "@/features/auth/guards/RequireAuth";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { PasswordChangeScreen } from "@/features/my/components/PasswordChangeScreen";
import { server } from "@/mocks/server";
import { renderWithProviders } from "@/test/renderWithProviders";

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
}

function renderPasswordChangeScreen() {
  const router = createMemoryRouter(
    [
      {
        path: "/my/profile/password",
        element: <RequireAuth />,
        children: [{ index: true, element: <PasswordChangeScreen /> }],
      },
      { path: "/login/email", element: <p>이메일 로그인 화면</p> },
      { path: "/login", element: <p>로그인 화면</p> },
    ],
    { initialEntries: ["/my/profile/password"] },
  );

  return {
    router,
    ...renderWithProviders(<RouterProvider router={router} />),
  };
}

async function fillPasswordChangeForm(
  user: ReturnType<typeof renderWithProviders>["user"],
) {
  await user.type(
    screen.getByLabelText(/현재 비밀번호/, { selector: "input" }),
    "old-password",
  );
  await user.type(
    screen.getByLabelText(/^새 비밀번호 \*$/, { selector: "input" }),
    "newpass1",
  );
  await user.type(
    screen.getByLabelText(/새 비밀번호 확인/, { selector: "input" }),
    "newpass1",
  );
}

function setAuthenticatedUser() {
  useAuthStore.setState({
    accessToken: "mock-access-token-1-1",
    isAuthenticated: true,
    authInitialized: true,
  });
}

describe("PasswordChangeScreen", () => {
  it("화면이 unmount되어도 성공한 비밀번호 변경은 인증 상태를 정리한다", async () => {
    setAuthenticatedUser();

    const response = createDeferred<void>();
    const requestStarted = createDeferred<void>();

    server.use(
      http.patch("*/api/v1/users/me/password", async () => {
        requestStarted.resolve();
        await response.promise;

        return HttpResponse.json({
          success: true,
          data: null,
          error: null,
        });
      }),
    );

    const { user, unmount } = renderPasswordChangeScreen();

    await screen.findByLabelText(/현재 비밀번호/, { selector: "input" });
    await fillPasswordChangeForm(user);
    await user.click(screen.getByRole("button", { name: "비밀번호 변경" }));
    await requestStarted.promise;

    unmount();
    response.resolve();

    await waitFor(() => {
      expect(useAuthStore.getState()).toMatchObject({
        accessToken: null,
        isAuthenticated: false,
      });
    });
  });

  it("성공하면 인증 상태를 정리하고 이메일 로그인 화면으로 이동한다", async () => {
    setAuthenticatedUser();

    server.use(
      http.patch("*/api/v1/users/me/password", () =>
        HttpResponse.json({
          success: true,
          data: null,
          error: null,
        }),
      ),
    );

    const { router, user } = renderPasswordChangeScreen();

    await screen.findByLabelText(/현재 비밀번호/, { selector: "input" });
    await fillPasswordChangeForm(user);
    await user.click(screen.getByRole("button", { name: "비밀번호 변경" }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/login/email");
      expect(router.state.location.state).toEqual({ from: "/home" });
      expect(useAuthStore.getState()).toMatchObject({
        accessToken: null,
        isAuthenticated: false,
      });
    });

    expect(screen.getByText("이메일 로그인 화면")).toBeInTheDocument();
  });
});
