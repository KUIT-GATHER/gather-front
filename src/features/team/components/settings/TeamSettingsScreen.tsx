import { useState } from "react";
import { Navigate, useNavigate } from "react-router";

import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";
import { TeamSettingsMenuItem } from "@/features/team/components/settings/TeamSettingsMenuItem";
import { useQuery } from "@tanstack/react-query";
import { teamQueries } from "@/features/team/api/team.queries";
import { useDisbandMeetingMutation } from "@/features/team/hooks/useMeetingManagementMutations";
import { ApiError } from "@/shared/api/apiError";
import Button from "@/shared/ui/Button";

import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import MemberManagementIcon from "@/shared/assets/puzzle/activity.svg";
import ActivityManagementIcon from "@/shared/assets/puzzle/application.svg";
import InformationIcon from "@/shared/assets/puzzle/information-square.svg";
import JoinRequestManagementIcon from "@/shared/assets/puzzle/member.svg";

export function TeamSettingsScreen() {
  const { home, isHost } = useTeamDetailContext();
  const navigate = useNavigate();
  const [isDissolveDialogOpen, setIsDissolveDialogOpen] = useState(false);
  const [dissolveError, setDissolveError] = useState<string | null>(null);
  const disbandMutation = useDisbandMeetingMutation(home.meetingId);

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
          iconSrc={MemberManagementIcon}
          title="멤버 관리"
          description={`${home.currentMemberCount}명 참여중`}
          onClick={() => {
            navigate(`/teams/${home.meetingId}/settings/members`);
          }}
        />

        <TeamSettingsMenuItem
          iconSrc={JoinRequestManagementIcon}
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
          iconSrc={ActivityManagementIcon}
          title="활동 관리"
          description="모임 내 봉사활동 관리"
          onClick={() => {
            navigate(`/teams/${home.meetingId}/settings/activities`);
          }}
        />
      </div>
      <Button
        variant="danger"
        fullWidth
        className="mt-10"
        onClick={() => {
          setIsDissolveDialogOpen(true);
        }}
      >
        모임 해산하기
      </Button>
      {dissolveError ? (
        <p role="alert" className="mt-3 text-sm text-point-red">
          {dissolveError}
        </p>
      ) : null}
      <ConfirmDialog
        open={isDissolveDialogOpen}
        title="정말 모임을 해산하시겠습니까?"
        description="모임과 게시글은 더 이상 확인할 수 없고 복구할 수 없습니다. 완료한 봉사 기록, 인정시간, 후기와 뱃지는 유지됩니다."
        confirmText="확인"
        confirmVariant="primary"
        onCancel={() => {
          setIsDissolveDialogOpen(false);
        }}
        isPending={disbandMutation.isPending}
        onConfirm={() => {
          setDissolveError(null);
          disbandMutation.mutate(undefined, {
            onSuccess: () => navigate("/teams", { replace: true }),
            onError: (error) => {
              setIsDissolveDialogOpen(false);
              setDissolveError(
                error instanceof ApiError && error.status === 409
                  ? "진행 예정 활동에 확정 참가자가 있어 모임을 해산할 수 없어요."
                  : "모임을 해산하지 못했어요. 잠시 후 다시 시도해 주세요.",
              );
            },
          });
        }}
      />
    </main>
  );
}
