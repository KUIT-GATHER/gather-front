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
    <main className="min-h-dvh bg-bg px-5.5">
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
      <section className="pb-28 pt-6">
        {query.isLoading ? (
          <LoadingState className="min-h-60" label="활동을 불러오는 중" />
        ) : query.isError ? (
          <ErrorState
            className="min-h-60"
            title="활동을 불러오지 못했어요"
            primaryAction={{
              label: "다시 시도",
              onClick: () => void query.refetch(),
            }}
          />
        ) : query.data?.length === 0 ? (
          <EmptyState
            className="min-h-60"
            title="등록된 봉사활동이 없어요"
            description="모임에서 진행할 봉사활동을 등록해 주세요."
          />
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
