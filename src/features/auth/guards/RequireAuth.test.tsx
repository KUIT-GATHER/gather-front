import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";

import { RequireAuth } from "@/features/auth/guards/RequireAuth";
import { useAuthStore } from "@/features/auth/store/auth.store";

function renderRequireAuth(initialEntry: string) {
  const router = createMemoryRouter(
    [
      {
        path: "/protected",
        element: <RequireAuth />,
        children: [{ index: true, element: <p>보호된 화면</p> }],
      },
      { path: "/login", element: <p>로그인 화면</p> },
    ],
    { initialEntries: [initialEntry] },
  );

  render(<RouterProvider router={router} />);

  return router;
}

describe("RequireAuth", () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      isAuthenticated: false,
      authInitialized: false,
    });
  });

  it("인증 초기화 전에는 로딩 상태를 표시한다", () => {
    renderRequireAuth("/protected");

    expect(screen.getByRole("status")).toHaveTextContent(
      "로그인 정보를 확인하고 있습니다.",
    );
  });

  it("비로그인 사용자를 원래 전체 경로와 함께 로그인 화면으로 이동한다", async () => {
    useAuthStore.setState({ authInitialized: true });

    const router = renderRequireAuth("/protected?tab=recent#content");

    await screen.findByText("로그인 화면");

    expect(router.state.location.pathname).toBe("/login");
    expect(router.state.location.state).toEqual({
      from: "/protected?tab=recent#content",
    });
  });

  it("로그인 사용자는 보호된 하위 라우트를 렌더링한다", () => {
    useAuthStore.setState({
      accessToken: "test-access-token",
      isAuthenticated: true,
      authInitialized: true,
    });

    renderRequireAuth("/protected");

    expect(screen.getByText("보호된 화면")).toBeInTheDocument();
  });
});
