import { useState } from "react";
import { useNavigate } from "react-router";

import { VolunteerPostingApplyBar } from "@/features/volunteer/components/VolunteerPostingApplyBar";
import { VolunteerPostingApplicationDialog } from "@/features/volunteer/components/VolunteerPostingApplicationDialog";
import { VolunteerPostingConditionCard } from "@/features/volunteer/components/VolunteerPostingConditionCard";
import { VolunteerPostingHeader } from "@/features/volunteer/components/VolunteerPostingHeader";
import { VolunteerPostingHero } from "@/features/volunteer/components/VolunteerPostingHero";
import { VolunteerPostingInfoCard } from "@/features/volunteer/components/VolunteerPostingInfoCard";
import { VolunteerPostingTeamSection } from "@/features/volunteer/components/VolunteerPostingTeamSection";
import { useVolunteerPostingBookmarkMutation } from "@/features/volunteer/hooks/useVolunteerPostingBookmarkMutation";
import { useVolunteerPostingDetail } from "@/features/volunteer/hooks/useVolunteerPostingDetail";
import type { VolunteerPostingApplicationLink } from "@/features/volunteer/types/volunteerApplication.types";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { cn } from "@/shared/lib/cn";
import LoadingState from "@/shared/ui/LoadingState";

type VolunteerPostingDetailProps = {
  postingId: number;
};

const TEMP_APPLICATION_LINKS: VolunteerPostingApplicationLink[] = [
  {
    id: "1365",
    label: "1365 자원봉사포털 신청",
    url: "https://www.1365.go.kr/vols/main.do",
  },
  {
    id: "vms",
    label: "사회복지 자원봉사 인증 관리 시스템 신청",
    url: "https://www.vms.or.kr/main.do",
  },
];

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
  const postingQuery = useVolunteerPostingDetail(postingId);
  const bookmarkMutation = useVolunteerPostingBookmarkMutation(postingId);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  const [selectedApplicationLink, setSelectedApplicationLink] =
    useState<VolunteerPostingApplicationLink | null>(null);

  const closeApplicationDialog = () => {
    setIsApplicationDialogOpen(false);
    setSelectedApplicationLink(null);
  };

  const handleBookmarkToggle = () => {
    const nextIsBookmarked = !isBookmarked;

    setIsBookmarked(nextIsBookmarked);

    bookmarkMutation.mutate(nextIsBookmarked, {
      onSuccess: (bookmark) => {
        setIsBookmarked(bookmark.bookmarked);
      },
      onError: () => {
        setIsBookmarked(!nextIsBookmarked);
      },
    });
  };

  const handleApplicationDialogOpenChange = (nextOpen: boolean) => {
    setIsApplicationDialogOpen(nextOpen);

    if (!nextOpen) {
      setSelectedApplicationLink(null);
    }
  };

  const handleApply = () => {
    if (!selectedApplicationLink) {
      return;
    }

    window.location.assign(selectedApplicationLink.url);
  };

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
    return (
      <>
        <VolunteerPostingHeader onBack={() => navigate(-1)} />
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
        isBookmarked={isBookmarked}
        isBookmarkPending={bookmarkMutation.isPending}
        onBookmarkToggle={handleBookmarkToggle}
        sticky
      />

      <div className="pt-1">
        <VolunteerPostingHero posting={posting} />
        <VolunteerPostingDivider className="mt-5" />
        <VolunteerPostingInfoCard posting={posting} className="mt-5" />
        <VolunteerPostingConditionCard posting={posting} className="mt-4" />
        <VolunteerPostingDivider className="mt-5" />
        <VolunteerPostingTeamSection postingId={posting.id} className="mt-5" />
      </div>

      <VolunteerPostingApplyBar
        onApplyClick={() => setIsApplicationDialogOpen(true)}
      />
      <VolunteerPostingApplicationDialog
        open={isApplicationDialogOpen}
        posting={posting}
        links={TEMP_APPLICATION_LINKS}
        selectedLink={selectedApplicationLink}
        onOpenChange={handleApplicationDialogOpenChange}
        onSelectLink={setSelectedApplicationLink}
        onCancel={closeApplicationDialog}
        onApply={handleApply}
      />
    </article>
  );
}
