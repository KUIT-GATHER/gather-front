import { useNavigate } from "react-router";

import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  useAddVolunteerPostingBookmarkMutation,
  useRemoveVolunteerPostingBookmarkMutation,
} from "@/features/volunteer/hooks/useVolunteerPostingBookmarkMutation";
import { useVolunteerPostingDetail } from "@/features/volunteer/hooks/useVolunteerPostingDetail";
import { ApiError } from "@/shared/api/apiError";
import { API_ERROR_CODE } from "@/shared/constants/apiErrorCode";
import { cn } from "@/shared/lib/cn";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";

import { VolunteerPostingApplyBar } from "./VolunteerPostingApplyBar";
import { VolunteerPostingConditionCard } from "./VolunteerPostingConditionCard";
import { VolunteerPostingHeader } from "./VolunteerPostingHeader";
import { VolunteerPostingHero } from "./VolunteerPostingHero";
import { VolunteerPostingInfoCard } from "./VolunteerPostingInfoCard";
import { VolunteerPostingTeamSection } from "./VolunteerPostingTeamSection";

type VolunteerPostingDetailProps = {
  postingId: number;
};

function VolunteerPostingDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn("-mx-5.5 h-1.5 bg-[#ECECEC]", className)}
      aria-hidden="true"
    />
  );
}

export function VolunteerPostingDetail({
  postingId,
}: VolunteerPostingDetailProps) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const postingQuery = useVolunteerPostingDetail(postingId);
  const addBookmarkMutation = useAddVolunteerPostingBookmarkMutation(postingId);
  const removeBookmarkMutation =
    useRemoveVolunteerPostingBookmarkMutation(postingId);
  const isBookmarkPending =
    addBookmarkMutation.isPending || removeBookmarkMutation.isPending;

  if (postingQuery.isLoading) {
    return (
      <>
        <VolunteerPostingHeader onBack={() => navigate(-1)} />
        <LoadingState
          label="봉사 공고를 불러오는 중"
          className="min-h-[calc(100dvh-7rem)]"
        />
      </>
    );
  }

  if (postingQuery.isError) {
    const isPostingNotFound =
      postingQuery.error instanceof ApiError &&
      postingQuery.error.code === API_ERROR_CODE.POSTING_NOT_FOUND;

    return (
      <>
        <VolunteerPostingHeader onBack={() => navigate(-1)} />
        <ErrorState
          className="min-h-[calc(100dvh-7rem)] justify-center"
          title={
            isPostingNotFound
              ? "봉사 공고를 찾을 수 없어요"
              : "봉사 공고를 불러오지 못했어요"
          }
          description={
            isPostingNotFound
              ? "삭제되었거나 존재하지 않는 봉사 공고예요."
              : "잠시 후 다시 시도해 주세요."
          }
          primaryAction={
            isPostingNotFound
              ? {
                  label: "봉사공고 목록으로 이동",
                  onClick: () => navigate("/volunteers"),
                }
              : {
                  label: "다시 시도",
                  onClick: () => {
                    void postingQuery.refetch();
                  },
                }
          }
          secondaryAction={
            isPostingNotFound
              ? undefined
              : {
                  label: "이전 페이지",
                  onClick: () => navigate(-1),
                }
          }
        />
      </>
    );
  }

  const posting = postingQuery.data;
  const handleBookmarkToggle = () => {
    if (!posting) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: `/volunteers/${posting.id}`,
        },
      });
      return;
    }

    if (posting.bookmarked) {
      removeBookmarkMutation.mutate();
      return;
    }

    addBookmarkMutation.mutate();
  };

  if (!posting) {
    return (
      <>
        <VolunteerPostingHeader onBack={() => navigate(-1)} />
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
      <VolunteerPostingHeader
        title={posting.title}
        onBack={() => navigate(-1)}
        isBookmarked={posting.bookmarked}
        isBookmarkPending={isBookmarkPending}
        onBookmarkToggle={handleBookmarkToggle}
        sticky
      />

      <div className="pt-1">
        <VolunteerPostingHero posting={posting} />
        <VolunteerPostingDivider className="mt-5" />
        <VolunteerPostingInfoCard posting={posting} className="mt-5" />
        <VolunteerPostingConditionCard posting={posting} className="mt-4" />
        <VolunteerPostingDivider className="mt-5" />
        <VolunteerPostingTeamSection className="mt-5" />
      </div>

      <VolunteerPostingApplyBar disabled />
    </article>
  );
}
