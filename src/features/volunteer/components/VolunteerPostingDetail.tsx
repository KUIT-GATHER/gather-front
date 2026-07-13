import { useNavigate } from "react-router";

import { VolunteerPostingApplyBar } from "@/features/volunteer/components/VolunteerPostingApplyBar";
import { VolunteerPostingConditionCard } from "@/features/volunteer/components/VolunteerPostingConditionCard";
import { VolunteerPostingHero } from "@/features/volunteer/components/VolunteerPostingHero";
import { VolunteerPostingInfoCard } from "@/features/volunteer/components/VolunteerPostingInfoCard";
import { VolunteerPostingTeamSection } from "@/features/volunteer/components/VolunteerPostingTeamSection";
import { useVolunteerPostingDetail } from "@/features/volunteer/hooks/useVolunteerPostingDetail";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";
import PageHeader from "@/shared/ui/PageHeader";

type VolunteerPostingDetailProps = {
  postingId: number;
};

export function VolunteerPostingDetail({
  postingId,
}: VolunteerPostingDetailProps) {
  const navigate = useNavigate();
  const postingQuery = useVolunteerPostingDetail(postingId);

  if (postingQuery.isLoading) {
    return (
      <>
        <PageHeader title="봉사 공고" onBack={() => navigate(-1)} />
        <LoadingState
          label="봉사 공고를 불러오는 중"
          className="min-h-[calc(100dvh-7rem)]"
        />
      </>
    );
  }

  if (postingQuery.isError) {
    return (
      <>
        <PageHeader title="봉사 공고" onBack={() => navigate(-1)} />
        <ErrorState
          className="min-h-[calc(100dvh-7rem)] justify-center"
          title="봉사 공고를 불러오지 못했어요"
          description="잠시 후 다시 시도해 주세요."
          primaryAction={{
            label: "다시 시도",
            onClick: () => {
              void postingQuery.refetch();
            },
          }}
          secondaryAction={{
            label: "이전 페이지",
            onClick: () => navigate(-1),
          }}
        />
      </>
    );
  }

  const posting = postingQuery.data;

  if (!posting) {
    return (
      <>
        <PageHeader title="봉사 공고" onBack={() => navigate(-1)} />
        <EmptyState
          className="mt-10"
          title="봉사 공고가 없어요"
          description="요청한 봉사 공고를 찾을 수 없어요."
          actionLabel="이전 페이지"
          onAction={() => navigate(-1)}
        />
      </>
    );
  }

  return (
    <article className="pb-[calc(env(safe-area-inset-bottom)+7.25rem)]">
      <PageHeader title={posting.title} onBack={() => navigate(-1)} sticky />

      <div className="flex flex-col gap-3 pt-3">
        <VolunteerPostingHero posting={posting} />
        <VolunteerPostingInfoCard posting={posting} />
        <VolunteerPostingConditionCard posting={posting} />
        <VolunteerPostingTeamSection postingId={posting.id} />
      </div>

      <VolunteerPostingApplyBar />
    </article>
  );
}
