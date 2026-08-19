import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TeamCreateScreen } from "@/features/team/components/create/TeamCreateScreen";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { server } from "@/mocks/server";
import { renderWithProviders } from "@/test/renderWithProviders";

function LocationProbe() {
  const location = useLocation();

  return <output data-testid="location">{location.pathname}</output>;
}

function renderCreateScreen() {
  return renderWithProviders(
    <MemoryRouter initialEntries={["/teams/new"]}>
      <Routes>
        <Route path="/teams/new" element={<TeamCreateScreen />} />
        <Route path="/teams/new/complete" element={<p>생성 완료</p>} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>,
  );
}

describe("TeamCreateScreen integration", () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, "scrollTo", {
      configurable: true,
      value: vi.fn(),
    });
  });

  it("필수 정보가 없으면 모임 생성 요청을 보내지 않는다", async () => {
    let createCalls = 0;
    server.use(
      http.post("*/api/v1/meetings", () => {
        createCalls += 1;
        return HttpResponse.json({ success: true, data: {}, error: null });
      }),
    );

    const { user } = renderCreateScreen();
    await user.click(screen.getByRole("button", { name: "모임 만들기 완료" }));

    expect(createCalls).toBe(0);
    expect(screen.getByText("모임 이름을 입력해 주세요.")).toBeInTheDocument();
    expect(screen.getByText("모임 소개를 입력해 주세요.")).toBeInTheDocument();
  });

  it("자유 모임의 핵심 입력을 연결해 생성 요청을 한 번 보내고 완료 화면으로 이동한다", async () => {
    let createCalls = 0;
    let requestBody: Record<string, unknown> | undefined;
    server.use(
      http.post("*/api/v1/meetings", async ({ request }) => {
        createCalls += 1;
        requestBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          success: true,
          data: { meetingId: 777 },
          error: null,
        });
      }),
    );
    useAuthStore.setState({
      accessToken: "mock-access-token-1-test",
      isAuthenticated: true,
    });

    const { user } = renderCreateScreen();
    await user.type(
      screen.getByPlaceholderText("모임 이름을 입력해 주세요."),
      "  환경 모임  ",
    );
    await user.type(
      screen.getByPlaceholderText("모임을 소개해주세요."),
      "  함께 활동해요  ",
    );
    await user.click(
      screen.getByRole("button", { name: "활동 지역을 선택해 주세요" }),
    );
    await user.click(
      await screen.findByRole("button", { name: "서울특별시 전체" }),
    );
    await user.click(screen.getByRole("button", { name: "적용하기" }));
    await user.click(screen.getByRole("button", { name: "환경 카테고리" }));
    await user.click(screen.getByRole("button", { name: /신청 마감일/ }));
    await user.click(screen.getByRole("button", { name: "적용하기" }));
    await user.click(screen.getByRole("button", { name: "모임 만들기 완료" }));

    expect(createCalls).toBe(1);
    expect(requestBody).toMatchObject({
      name: "환경 모임",
      description: "함께 활동해요",
      categories: ["ENVIRONMENT"],
      regionId: 2,
      activityStartAt: null,
      activityEndAt: null,
      timeRecognized: false,
    });
    expect(screen.getByText("생성 완료")).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/teams/new/complete",
    );
  });
});
