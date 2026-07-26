import { Outlet, useParams } from "react-router";

import { TeamDetailScreen } from "@/features/team/components/detail/TeamDetailScreen";
import { TeamDetailProvider } from "@/features/team/components/detail/TeamDetailProvider";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useMeetingDetailQuery } from "@/features/team/hooks/useMeetingDetailQuery";
import { useMeetingHomeQuery } from "@/features/team/hooks/useMeetingHomeQuery";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";

export function TeamDetailPage() {
  const { teamId } = useParams();
  const authInitialized = useAuthStore((state) => state.authInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const meetingId = Number(teamId);
  const hasValidMeetingId = Number.isInteger(meetingId) && meetingId > 0;
  const safeMeetingId = hasValidMeetingId ? meetingId : 0;
  const homeQuery = useMeetingHomeQuery(safeMeetingId, {
    enabled: hasValidMeetingId && authInitialized,
    isAuthenticated,
  });
  const detailQuery = useMeetingDetailQuery(safeMeetingId, {
    enabled: hasValidMeetingId && authInitialized,
    isAuthenticated,
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

  if (!authInitialized) {
    return (
      <LoadingState
        className="mx-auto min-h-dvh max-w-app justify-center px-5.5"
        label="로그인 정보를 확인하고 있습니다."
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

  const isJoined = homeQuery.data.member || homeQuery.data.host;
  const isHost = homeQuery.data.host;

  return (
    <TeamDetailProvider
      meetingId={safeMeetingId}
      home={homeQuery.data}
      detail={detailQuery.data}
      authInitialized={authInitialized}
      isAuthenticated={isAuthenticated}
      isJoined={isJoined}
      isHost={isHost}
    >
      <div className="mx-auto min-h-dvh max-w-app bg-bg">
        <TeamDetailScreen
          home={homeQuery.data}
          isJoined={isJoined}
          isHost={isHost}
        >
          <Outlet />
        </TeamDetailScreen>
      </div>
    </TeamDetailProvider>
  );
}
