import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { useVolunteerPostingApplicationFlow } from "@/features/volunteer/hooks/detail/useVolunteerPostingApplicationFlow";
import type { VolunteerPosting } from "@/features/volunteer/types/volunteer.types";
import { server } from "@/mocks/server";
import { createTestQueryClient } from "@/test/createTestQueryClient";

function createPosting(
  overrides: Partial<VolunteerPosting> = {},
): VolunteerPosting {
  return {
    id: 42,
    title: "환경 정화 봉사",
    status: "RECRUITING",
    content: "함께 활동해요.",
    recruitOrg: "Gather",
    registerOrg: null,
    actStartDate: "2099-08-20",
    actEndDate: "2099-08-21",
    actStartTime: "10:00",
    actEndTime: "12:00",
    noticeStartDate: "2099-08-01",
    noticeEndDate: "2099-08-19",
    actWkdy: null,
    recruitCount: 10,
    applicantCount: 0,
    isAdult: true,
    isTeen: true,
    isGroup: false,
    actPlace: "서울",
    managerName: null,
    managerTel: null,
    managerFax: null,
    managerEmail: null,
    managerAddress: null,
    regionId: 1,
    regionName: "서울",
    category: "ENVIRONMENT",
    locations: [],
    createdAt: null,
    updatedAt: null,
    source: "API_1365",
    applicationUrl: null,
    bookmarked: false,
    participationStatus: null,
    participationStartDate: null,
    participationEndDate: null,
    participationAction: "APPLY",
    ...overrides,
  };
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useVolunteerPostingApplicationFlow", () => {
  it("비로그인 사용자의 신청을 막고 로그인 유도를 호출한다", () => {
    const onLoginRequired = vi.fn();
    const { result } = renderHook(
      () =>
        useVolunteerPostingApplicationFlow({
          posting: createPosting(),
          postingId: 42,
          isAuthenticated: false,
          onLoginRequired,
          refetchPosting: vi.fn(),
        }),
      { wrapper: createWrapper(createTestQueryClient()) },
    );

    act(() => result.current.handleApplyClick());

    expect(onLoginRequired).toHaveBeenCalledWith(42);
    expect(result.current.applyConfirmSheetProps.open).toBe(false);
  });

  it("인증된 사용자의 신청 일정으로 participation 요청을 보낸다", async () => {
    const requestBody = {
      participationStartDate: "2099-08-20",
      participationEndDate: "2099-08-21",
    };
    server.use(
      http.post("*/api/v1/postings/42/participations", async ({ request }) => {
        expect(await request.json()).toEqual(requestBody);
        return HttpResponse.json({
          success: true,
          data: {
            participationId: 7,
            status: "APPLIED",
            ...requestBody,
          },
          error: null,
        });
      }),
    );

    const { result } = renderHook(
      () =>
        useVolunteerPostingApplicationFlow({
          posting: createPosting(),
          postingId: 42,
          isAuthenticated: true,
          onLoginRequired: vi.fn(),
          refetchPosting: vi.fn(),
        }),
      { wrapper: createWrapper(createTestQueryClient()) },
    );

    act(() => result.current.handleApplyClick());
    act(() => result.current.scheduleSheetProps.onConfirm(requestBody));

    await waitFor(() => {
      expect(result.current.isApplyPending).toBe(false);
      expect(result.current.scheduleSheetProps.open).toBe(false);
    });
  });

  it("이미 신청한 경우 최신 posting 상태를 다시 조회한다", async () => {
    const refetchPosting = vi.fn();
    server.use(
      http.post("*/api/v1/postings/42/participations", () =>
        HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "PARTICIPATION_DUPLICATE",
              message: "Already applied.",
            },
          },
          { status: 409 },
        ),
      ),
    );

    const { result } = renderHook(
      () =>
        useVolunteerPostingApplicationFlow({
          posting: createPosting(),
          postingId: 42,
          isAuthenticated: true,
          onLoginRequired: vi.fn(),
          refetchPosting,
        }),
      { wrapper: createWrapper(createTestQueryClient()) },
    );

    act(() =>
      result.current.scheduleSheetProps.onConfirm({
        participationStartDate: "2099-08-20",
        participationEndDate: "2099-08-21",
      }),
    );

    await waitFor(() => expect(refetchPosting).toHaveBeenCalledTimes(1));
  });

  it("외부 신청 URL이 없으면 새 창을 열지 않고 오류를 표시한다", async () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const { result } = renderHook(
      () =>
        useVolunteerPostingApplicationFlow({
          posting: createPosting(),
          postingId: 42,
          isAuthenticated: true,
          onLoginRequired: vi.fn(),
          refetchPosting: vi.fn(),
        }),
      { wrapper: createWrapper(createTestQueryClient()) },
    );

    act(() =>
      result.current.applyConfirmSheetProps.onOpenExternalApplication(),
    );

    expect(open).not.toHaveBeenCalled();
    expect(result.current.applyConfirmSheetProps.errorMessage).toBe(
      "외부 신청 페이지를 열 수 없는 공고예요.",
    );

    open.mockRestore();
  });

  it("외부 신청 URL이 있으면 새 탭을 연다", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const { result } = renderHook(
      () =>
        useVolunteerPostingApplicationFlow({
          posting: createPosting({ applicationUrl: "https://apply.example" }),
          postingId: 42,
          isAuthenticated: true,
          onLoginRequired: vi.fn(),
          refetchPosting: vi.fn(),
        }),
      { wrapper: createWrapper(createTestQueryClient()) },
    );

    act(() =>
      result.current.applyConfirmSheetProps.onOpenExternalApplication(),
    );

    expect(open).toHaveBeenCalledWith(
      "https://apply.example",
      "_blank",
      "noopener,noreferrer",
    );
    open.mockRestore();
  });
});
