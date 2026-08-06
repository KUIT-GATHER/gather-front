import { useState } from "react";
import { Navigate, useNavigate } from "react-router";

import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";
import { TeamSettingsMenuItem } from "@/features/team/components/settings/TeamSettingsMenuItem";
import { useQuery } from "@tanstack/react-query";
import { teamQueries } from "@/features/team/api/team.queries";

import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import InformationIcon from "@/assets/team/information-square.svg";
import MemberIcon from "@/assets/team/member.svg";
import ActivityIcon from "@/assets/team/activity.svg";
import ApplicationIcon from "@/assets/team/application.svg";

export function TeamSettingsPage() {
  const { home, isHost } = useTeamDetailContext();
  const navigate = useNavigate();
  const [isDissolveDialogOpen, setIsDissolveDialogOpen] = useState(false);

  const joinRequestsQuery = useQuery({
    ...teamQueries.joinRequests(home.meetingId),
    enabled: isHost,
  });

  const pendingCount = (joinRequestsQuery.data ?? []).filter(
    (request) => request.status === "PENDING",
  ).length;

  const meetingTypeLabel = home.basedOnPosting ? "공고 기반 모임" : "자유 모임";

  const meetingStatusLabel =
    home.status === "RECRUITING"
      ? "모집중"
      : home.status === "CLOSED"
        ? "모집 마감"
        : "활동 완료";

  if (!isHost) {
    return <Navigate to={`/teams/${home.meetingId}`} replace />;
  }

  return (
    <main className="px-5.5 py-4">
      <div className="flex flex-col gap-2">
        <TeamSettingsMenuItem
          iconSrc={InformationIcon}
          title="팀 정보 수정"
          description={`${meetingTypeLabel} · ${meetingStatusLabel}`}
          onClick={() => {
            navigate(`/teams/${home.meetingId}/settings/info`);
          }}
        />

        <TeamSettingsMenuItem
          iconSrc={MemberIcon}
          title="멤버 관리"
          description={`${home.currentMemberCount}명 참여중`}
          onClick={() => {
            navigate(`/teams/${home.meetingId}/settings/members`);
          }}
        />

        <TeamSettingsMenuItem
          iconSrc={ApplicationIcon}
          title="가입 신청 관리"
          description={
            joinRequestsQuery.isLoading
              ? "불러오는 중"
              : joinRequestsQuery.isError
                ? "불러오지 못했어요"
                : `${pendingCount}명 대기 중`
          }
          onClick={() => {
            navigate(`/teams/${home.meetingId}/settings/applications`);
          }}
        />

        <TeamSettingsMenuItem
          iconSrc={ActivityIcon}
          title="활동 관리"
          description="모임 내 봉사활동 관리"
          onClick={() => {
            navigate(`/teams/${home.meetingId}/settings/activities`);
          }}
        />
      </div>
      <button
        type="button"
        className="mt-10 h-12 w-full rounded-[12px] bg-[#F76073] text-body-15-medium text-[#FAFAF8]"
        onClick={() => {
          setIsDissolveDialogOpen(true);
        }}
      >
        모임 해산하기
      </button>
      <ConfirmDialog
        open={isDissolveDialogOpen}
        title="정말 모임을 해산하시겠습니까?"
        description="해산한 모임의 기록은 모두 사라지고 되돌릴 수 없습니다"
        confirmText="확인"
        confirmVariant="primary"
        onCancel={() => {
          setIsDissolveDialogOpen(false);
        }}
        onConfirm={() => {
          // 모임 해산 API 연결 위치
        }}
      />
    </main>
  );
}
