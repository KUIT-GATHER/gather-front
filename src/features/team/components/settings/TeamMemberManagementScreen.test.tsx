import { QueryClientProvider } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import { http } from "msw";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";

import { TeamDetailContext } from "@/features/team/components/detail/TeamDetailContext";
import { TeamMemberManagementScreen } from "@/features/team/components/settings/TeamMemberManagementScreen";
import type {
  MeetingDetail,
  MeetingHome,
} from "@/features/team/types/team.types";
import { server } from "@/mocks/server";
import { createTestQueryClient } from "@/test/createTestQueryClient";
import { render } from "@testing-library/react";

function createHome(host: boolean): MeetingHome {
  return {
    meetingId: 1,
    name: "환경 지킴이 모임",
    description: "함께 활동해요.",
    deadline: "2099-08-19T18:00:00",
    regionName: "마포구",
    currentMemberCount: 2,
    maxMember: 10,
    timeRecognized: false,
    status: "RECRUITING",
    basedOnPosting: false,
    linkedPostingId: null,
    linkedPostingTitle: null,
    participationCondition: null,
    members: [
      { userId: 1, nickname: "팀장", role: "HOST", host: true },
      { userId: 2, nickname: "팀원", role: "MEMBER", host: false },
    ],
    upcomingActivity: null,
    member: host,
    host,
    pendingJoinRequested: false,
    myPendingJoinRequestId: null,
  };
}

function createDetail(home: MeetingHome): MeetingDetail {
  return {
    meetingId: home.meetingId,
    name: home.name,
    description: home.description,
    currentMemberCount: home.currentMemberCount,
    maxMember: home.maxMember,
    regionId: 1,
    regionName: home.regionName ?? "",
    categories: ["ENVIRONMENT"],
    status: home.status,
    deadline: home.deadline,
    activityStartAt: "2099-08-20T10:00:00",
    activityEndAt: "2099-08-20T12:00:00",
    thumbnailUrl: null,
    hostId: 1,
    volunteerPostingId: null,
    participationCondition: home.participationCondition,
    memo: null,
    bookmarked: false,
    timeRecognized: false,
  };
}

function renderManagement(isHost: boolean) {
  const home = createHome(isHost);
  const queryClient = createTestQueryClient();
  const contextValue = {
    meetingId: home.meetingId,
    home,
    detail: createDetail(home),
    imageUrls: [],
    authInitialized: true,
    isAuthenticated: true,
    isJoined: true,
    isHost,
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/teams/1/settings/members"]}>
        <Routes>
          <Route
            path="/teams/1/settings/members"
            element={
              <TeamDetailContext.Provider value={contextValue}>
                <TeamMemberManagementScreen />
              </TeamDetailContext.Provider>
            }
          />
          <Route path="/teams/1" element={<p>팀 상세</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("TeamMemberManagementScreen permissions", () => {
  it("non-host는 멤버 관리 화면에 접근할 수 없고 멤버 상세 API도 호출하지 않는다", () => {
    let detailCalls = 0;
    server.use(
      http.get("*/api/v1/meetings/1/members/2", () => {
        detailCalls += 1;
        return new Response();
      }),
    );

    renderManagement(false);

    expect(screen.getByText("팀 상세")).toBeInTheDocument();
    expect(detailCalls).toBe(0);
  });

  it("host는 멤버 목록을 보고 일반 멤버만 내보낼 수 있다", () => {
    renderManagement(true);

    expect(
      screen.getByRole("heading", { name: "멤버 관리" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "내보내기" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("팀장")).toBeInTheDocument();
  });
});
