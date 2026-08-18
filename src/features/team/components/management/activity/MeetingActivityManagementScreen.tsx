import { Navigate, useNavigate } from "react-router";

import { ManagedRecruitCard } from "@/features/team/components/management/activity/ManagedRecruitCard";
import { useMeetingRecruitActivitiesQuery } from "@/features/team/hooks/useMeetingRecruitActivitiesQuery";
import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";
import PageHeader from "@/shared/ui/PageHeader";

export function MeetingActivityManagementScreen() {
  const navigate = useNavigate();
  const { home, isHost } = useTeamDetailContext();
  const query = useMeetingRecruitActivitiesQuery(home.meetingId, {
    enabled: isHost,
  });
  if (!isHost) return <Navigate to={`/teams/${home.meetingId}`} replace />;

  return (
    <main className="flex min-h-dvh flex-col bg-bg px-5.5">
      <PageHeader
        title="활동 관리"
        onBack={() => navigate(-1)}
        rightAction={
          <span className="rounded-lg bg-text-gray-400 px-3 py-1.5 text-xs text-white">
            팀장
          </span>
        }
        sticky
      />
      <section className="flex flex-1 flex-col pb-28 pt-6">
        {query.isLoading ? (
          <div className="flex min-h-60 flex-1 flex-col justify-center">
            <LoadingState label="활동을 불러오는 중" />
          </div>
        ) : query.isError ? (
          <div className="flex min-h-60 flex-1 flex-col justify-center">
            <ErrorState
              title="활동을 불러오지 못했어요"
              primaryAction={{
                label: "다시 시도",
                onClick: () => void query.refetch(),
              }}
            />
          </div>
        ) : query.data?.length === 0 ? (
          <div className="flex min-h-60 flex-1 flex-col justify-center">
            <EmptyState
              className="min-h-60"
              title="등록된 봉사활동이 없어요"
              description="모임에서 진행할 봉사활동을 등록해 주세요."
            />
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {query.data?.map((activity) => (
              <ManagedRecruitCard
                key={activity.postId}
                meetingId={home.meetingId}
                activity={activity}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
