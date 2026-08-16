import { MemoryRouter } from "react-router";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TeamDetailScreen } from "@/features/team/components/detail/TeamDetailScreen";
import type { MeetingHome } from "@/features/team/types/team.types";
import { renderWithProviders } from "@/test/renderWithProviders";

function createHome(): MeetingHome {
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
    members: [],
    upcomingActivity: null,
    member: true,
    host: false,
    pendingJoinRequested: false,
    myPendingJoinRequestId: null,
  };
}

function renderTeamDetail(
  isJoined: boolean,
  isHost: boolean,
  path = "/teams/1",
) {
  return renderWithProviders(
    <MemoryRouter initialEntries={[path]}>
      <TeamDetailScreen
        home={createHome()}
        isJoined={isJoined}
        isHost={isHost}
        isBookmarked={false}
        isBookmarkPending={false}
        onBookmarkToggle={() => undefined}
      >
        <p>상세 콘텐츠</p>
      </TeamDetailScreen>
    </MemoryRouter>,
  );
}

describe("TeamDetailScreen viewer permissions", () => {
  it("guest는 가입 영역을 보고 팀원 역할 UI를 보지 않는다", () => {
    renderTeamDetail(false, false);

    expect(
      screen.getByRole("button", { name: "모임 신청하기" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("팀원")).not.toBeInTheDocument();
  });

  it("member는 팀원 역할로 상세 화면을 본다", () => {
    renderTeamDetail(true, false);

    expect(screen.getByText("팀원")).toBeInTheDocument();
    expect(screen.queryByLabelText("모임 설정")).not.toBeInTheDocument();
  });

  it("leader는 팀장 역할과 모임 설정 진입점을 본다", () => {
    renderTeamDetail(true, true, "/teams/1/posts");

    expect(screen.getByText("팀장")).toBeInTheDocument();
    expect(screen.getByLabelText("모임 설정")).toBeInTheDocument();
  });
});
