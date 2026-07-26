import { useParams } from "react-router";

import { TeamDetailScreen } from "@/features/team/components/detail/TeamDetailScreen";
import { useMeetingDetailQuery } from "@/features/team/hooks/useMeetingDetailQuery";
import { useMeetingHomeQuery } from "@/features/team/hooks/useMeetingHomeQuery";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";

export function TeamDetailPage() {
  const { teamId } = useParams();
  const meetingId = Number(teamId);
  const hasValidMeetingId = Number.isInteger(meetingId) && meetingId > 0;
  const safeMeetingId = hasValidMeetingId ? meetingId : 0;
  const homeQuery = useMeetingHomeQuery(safeMeetingId, {
    enabled: hasValidMeetingId,
  });
  const detailQuery = useMeetingDetailQuery(safeMeetingId, {
    enabled: hasValidMeetingId,
  });

  if (!hasValidMeetingId) {
    return (
      <ErrorState
        className="mx-auto min-h-dvh max-w-app justify-center px-5.5"
        title="잘못된 모임 주소예요"
        description="모임 주소를 다시 확인해 주세요."
      />
    );
  }

  if (homeQuery.isLoading || detailQuery.isLoading) {
    return (
      <LoadingState
        className="mx-auto min-h-dvh max-w-app justify-center px-5.5"
        label="모임을 불러오는 중"
      />
    );
  }

  if (homeQuery.isError || detailQuery.isError) {
    return (
      <ErrorState
        className="mx-auto min-h-dvh max-w-app justify-center px-5.5"
        title="모임을 불러오지 못했어요"
        description="잠시 후 다시 시도해 주세요."
        primaryAction={{
          label: "다시 시도",
          onClick: () => {
            void homeQuery.refetch();
            void detailQuery.refetch();
          },
        }}
      />
    );
  }

  if (!homeQuery.data || !detailQuery.data) {
    return (
      <ErrorState
        className="mx-auto min-h-dvh max-w-app justify-center px-5.5"
        title="모임 정보가 없어요"
        description="요청한 모임 정보를 찾을 수 없어요."
      />
    );
  }

  return (
    <div className="mx-auto min-h-dvh max-w-app bg-bg">
      <TeamDetailScreen home={homeQuery.data} detail={detailQuery.data} />
    </div>
  );
}
