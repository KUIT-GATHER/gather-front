import { useNavigate, useSearchParams } from "react-router";

import { TeamActivityMenu } from "@/features/team/components/activity/TeamActivityMenu";
import { useLeaveMeetingMutation } from "@/features/team/hooks/useLeaveMeetingMutation";
import { useMyMeetingActivitySummaryQuery } from "@/features/team/hooks/useMyMeetingActivityQuery";
import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";

export function TeamActivityHomeScreen() {
  const navigate = useNavigate();
  const { isHost, meetingId } = useTeamDetailContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const summaryQuery = useMyMeetingActivitySummaryQuery(meetingId);
  const leaveMeetingMutation = useLeaveMeetingMutation(meetingId, {
    onSuccess: () => {
      closeLeaveDialog();
      navigate("/teams?tab=my", { replace: true });
    },
  });
  const isLeaveDialogOpen = !isHost && searchParams.get("leave") === "open";

  const openLeaveDialog = () => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("leave", "open");
    setSearchParams(nextSearchParams);
  };

  function closeLeaveDialog() {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("leave");
    setSearchParams(nextSearchParams, { replace: true });
  }

  const handleLeaveConfirm = () => {
    leaveMeetingMutation.mutate();
  };

  return (
    <section className="px-5.5 py-6" aria-busy={summaryQuery.isFetching}>
      <TeamActivityMenu
        meetingId={meetingId}
        isHost={isHost}
        isLoading={summaryQuery.isLoading}
        isError={summaryQuery.isError}
        appliedRecruitCount={summaryQuery.data?.appliedRecruitCount}
        writtenPostCount={summaryQuery.data?.writtenPostCount}
        commentedPostCount={summaryQuery.data?.commentedPostCount}
        onLeaveClick={openLeaveDialog}
      />

      <ConfirmDialog
        open={isLeaveDialogOpen}
        title={
          <>
            {'"한번 나가면 다시 승인되기 전까지'}
            <br />
            {'모임에 다시 참여할 수 없어요."'}
          </>
        }
        cancelText="취소"
        confirmText="탈퇴하기"
        onCancel={closeLeaveDialog}
        onConfirm={handleLeaveConfirm}
        isPending={leaveMeetingMutation.isPending}
      />
    </section>
  );
}
