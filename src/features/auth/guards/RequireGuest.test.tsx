import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";

import { RequireGuest } from "@/features/auth/guards/RequireGuest";
import { useAuthStore } from "@/features/auth/store/auth.store";

type GuestRouteEntry = {
  pathname: string;
  state?: unknown;
};

function renderRequireGuest(initialEntry: string | GuestRouteEntry) {
  const router = createMemoryRouter(
    [
      {
        path: "/login",
        element: <RequireGuest />,
        children: [{ index: true, element: <p>게스트 화면</p> }],
      },
      { path: "/home", element: <p>홈 화면</p> },
      { path: "/teams/:teamId/posts", element: <p>게시판 화면</p> },
    ],
    { initialEntries: [initialEntry] },
  );

  render(<RouterProvider router={router} />);

  return router;
}

describe("RequireGuest", () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      isAuthenticated: false,
      authInitialized: false,
    });
  });

  it("인증 초기화 전에는 로딩 상태를 표시한다", () => {
    renderRequireGuest("/login");

    expect(screen.getByRole("status")).toHaveTextContent(
      "로그인 정보를 확인하고 있습니다.",
    );
  });

  it("비로그인 사용자는 게스트 하위 라우트에 접근한다", () => {
    useAuthStore.setState({ authInitialized: true });

    renderRequireGuest("/login");

    expect(screen.getByText("게스트 화면")).toBeInTheDocument();
  });

  it("로그인 사용자는 기본적으로 홈으로 이동한다", async () => {
    useAuthStore.setState({
      accessToken: "test-access-token",
      isAuthenticated: true,
      authInitialized: true,
    });

    const router = renderRequireGuest("/login");

    await screen.findByText("홈 화면");

    expect(router.state.location.pathname).toBe("/home");
  });

  it("로그인 사용자는 안전한 from 경로로 이동한다", async () => {
    useAuthStore.setState({
      accessToken: "test-access-token",
      isAuthenticated: true,
      authInitialized: true,
    });

    const router = renderRequireGuest({
      pathname: "/login",
      state: { from: "/teams/1/posts" },
    });

    await screen.findByText("게시판 화면");

    expect(router.state.location.pathname).toBe("/teams/1/posts");
  });

  it("민감한 인증 경로는 로그인 후 홈으로 이동한다", async () => {
    useAuthStore.setState({
      accessToken: "test-access-token",
      isAuthenticated: true,
      authInitialized: true,
    });

    const router = renderRequireGuest({
      pathname: "/login",
      state: { from: "/my/profile/password" },
    });

    await screen.findByText("홈 화면");

    expect(router.state.location.pathname).toBe("/home");
  });

  it("외부 형태의 from 경로는 무시하고 홈으로 이동한다", async () => {
    useAuthStore.setState({
      accessToken: "test-access-token",
      isAuthenticated: true,
      authInitialized: true,
    });

    const router = renderRequireGuest({
      pathname: "/login",
      state: { from: "//evil.example" },
    });

    await screen.findByText("홈 화면");

    expect(router.state.location.pathname).toBe("/home");
  });
});
