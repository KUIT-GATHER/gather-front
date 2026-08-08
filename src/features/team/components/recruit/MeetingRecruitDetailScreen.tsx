import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { teamQueries } from "@/features/team/api/team.queries";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useToggleMeetingRecruitParticipationMutation } from "@/features/team/hooks/useMeetingRecruitMutations";
import { getEffectiveRecruitParticipationAction } from "@/features/team/lib/meetingRecruitParticipation";
import { VolunteerOpportunityConditionCard } from "@/features/volunteer/components/detail/VolunteerOpportunityConditionCard";
import { VolunteerOpportunityHero } from "@/features/volunteer/components/detail/VolunteerOpportunityHero";
import {
  VolunteerOpportunityInfoCard,
  type VolunteerOpportunityInfoRow,
} from "@/features/volunteer/components/detail/VolunteerOpportunityInfoCard";
import { VolunteerOpportunityTeamCard } from "@/features/volunteer/components/detail/VolunteerOpportunityTeamCard";
import { VolunteerPostingHeader } from "@/features/volunteer/components/detail/VolunteerPostingHeader";
import { getVolunteerPostingImage } from "@/features/volunteer/lib/getVolunteerPostingImage";
import {
  formatVolunteerDate,
  formatVolunteerPeriod,
  formatVolunteerTimeRange,
} from "@/features/volunteer/lib/volunteerPostingFormatters";
import { ApiError } from "@/shared/api/apiError";
import Button from "@/shared/ui/Button";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";
import PageContainer from "@/shared/ui/PageContainer";

function formatMeetingRecruitDeadline(value: string) {
  const date = formatVolunteerDate(value.slice(0, 10));
  const time = value.slice(11, 16);

  return date ? `${date} ${time}` : value.replace("T", " ").slice(0, 16);
}

function getMeetingRecruitInfoRows({
  regionName,
  place,
  activityStartAt,
  activityEndAt,
  appliedCount,
  maxParticipants,
  applyDeadlineAt,
  timeRecognized,
  recognizedMinutes,
}: {
  regionName: string;
  place: string;
  activityStartAt: string;
  activityEndAt: string;
  appliedCount: number;
  maxParticipants: number;
  applyDeadlineAt: string;
  timeRecognized: boolean;
  recognizedMinutes: number | null;
}): VolunteerOpportunityInfoRow[] {
  return [
    {
      id: "location",
      icon: "location",
      label: "장소",
      value: `${regionName} ${place}`.trim(),
    },
    {
      id: "date",
      icon: "date",
      label: "날짜",
      value:
        formatVolunteerPeriod(
          activityStartAt.slice(0, 10),
          activityEndAt.slice(0, 10),
        ) ?? "-",
    },
    {
      id: "time",
      icon: "time",
      label: "시간",
      value:
        formatVolunteerTimeRange(
          activityStartAt.slice(11, 16),
          activityEndAt.slice(11, 16),
        ) ?? "-",
    },
    {
      id: "participants",
      icon: "participants",
      label: "참여 인원",
      value: `${appliedCount}/${maxParticipants}명`,
    },
    {
      id: "deadline",
      icon: "deadline",
      label: "신청 마감",
      value: formatMeetingRecruitDeadline(applyDeadlineAt),
    },
    {
      id: "recognizedTime",
      icon: "time",
      label: "인정 시간",
      value: timeRecognized ? `${recognizedMinutes ?? 0}분` : "미인정",
    },
  ];
}

export function MeetingRecruitDetailScreen({
  meetingId,
  postId,
}: {
  meetingId: number;
  postId: number;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authInitialized = useAuthStore((state) => state.authInitialized);
  const recruitQuery = useQuery({
    ...teamQueries.recruitForViewer(meetingId, postId, isAuthenticated),
    enabled: authInitialized,
  });
  const imagesQuery = useQuery(teamQueries.images(meetingId));
  const participationMutation = useToggleMeetingRecruitParticipationMutation(
    meetingId,
    postId,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!authInitialized || recruitQuery.isLoading)
    return (
      <PageContainer className="min-h-dvh bg-bg">
        <VolunteerPostingHeader onBack={() => navigate(-1)} />
        <LoadingState
          className="min-h-[calc(100dvh-7rem)]"
          label="봉사 공고를 불러오는 중"
        />
      </PageContainer>
    );
  if (recruitQuery.isError) {
    const forbidden =
      recruitQuery.error instanceof ApiError &&
      recruitQuery.error.status === 403;
    return (
      <PageContainer className="min-h-dvh bg-bg">
        <VolunteerPostingHeader onBack={() => navigate(-1)} />
        <ErrorState
          className="mt-24"
          title={
            forbidden
              ? "접근할 수 없는 공고예요"
              : "봉사 공고를 불러오지 못했어요"
          }
          description={
            forbidden
              ? "승인된 모임원에게만 공개된 공고예요."
              : "잠시 후 다시 시도해 주세요."
          }
          primaryAction={{
            label: "다시 시도",
            onClick: () => void recruitQuery.refetch(),
          }}
        />
      </PageContainer>
    );
  }
  const recruit = recruitQuery.data;
  if (!recruit) return null;
  const participationCondition = recruit.participationCondition?.trim();
  const primaryCategory = recruit.categories[0] ?? "COMMUNITY";
  const heroImage =
    imagesQuery.data?.imageUrls[0] ??
    getVolunteerPostingImage(primaryCategory, recruit.postId);
  const infoRows = getMeetingRecruitInfoRows(recruit);
  const effectiveParticipationAction =
    getEffectiveRecruitParticipationAction(recruit);
  const actionLabel =
    effectiveParticipationAction === "APPLY"
      ? "신청하기"
      : effectiveParticipationAction === "CANCEL"
        ? "신청 완료"
        : recruit.participationStatus === "CONFIRMED"
          ? "참가 확정"
          : recruit.participationStatus === "COMPLETED" ||
              recruit.participationStatus === "REVIEWED"
            ? "활동 완료"
            : recruit.participationStatus === "REJECTED"
              ? "신청 반려"
              : "신청할 수 없어요";

  const requestParticipation = () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: location.pathname + location.search },
      });
      return;
    }
    setConfirmOpen(true);
  };

  return (
    <PageContainer className="min-h-dvh bg-bg">
      <article className="pb-[calc(env(safe-area-inset-bottom)+7.25rem)]">
        <VolunteerPostingHeader
          title={recruit.title}
          onBack={() => navigate(-1)}
          sticky
        />
        <div className="pt-1">
          <VolunteerOpportunityHero
            title={recruit.title}
            content={recruit.content}
            imageSrc={heroImage}
            imageAlt={`${recruit.meetingName} 대표 이미지`}
            categories={recruit.categories}
            regionName={recruit.regionName}
          />
          <VolunteerOpportunityInfoCard rows={infoRows} className="mt-5" />
          {participationCondition ? (
            <VolunteerOpportunityConditionCard
              condition={participationCondition}
              className="mt-4"
            />
          ) : null}
          <section className="mt-5 pt-1">
            <h2 className="text-title-18 text-text">함께하는 팀</h2>
            <div className="mt-4">
              <VolunteerOpportunityTeamCard
                name={recruit.meetingName}
                category={primaryCategory}
                activityLabel="모집 활동을 만든 모임"
                onClick={() => navigate(`/teams/${meetingId}`)}
              />
            </div>
          </section>
          {actionError ? (
            <p role="alert" className="mt-4 text-body-14 text-point-red">
              {actionError}
            </p>
          ) : null}
        </div>
      </article>
      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-app -translate-x-1/2 bg-bg px-5.5 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <Button
          fullWidth
          className="h-12"
          disabled={
            effectiveParticipationAction === "NONE" ||
            participationMutation.isPending
          }
          variant={
            effectiveParticipationAction === "CANCEL" ? "dark" : "primary"
          }
          aria-label={
            effectiveParticipationAction === "CANCEL"
              ? "신청 완료, 누르면 신청 취소"
              : undefined
          }
          onClick={requestParticipation}
        >
          {participationMutation.isPending ? "처리 중" : actionLabel}
        </Button>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title={
          effectiveParticipationAction === "CANCEL" ? (
            "봉사 신청을 취소하시겠어요?"
          ) : (
            <>
              신청 시 모임장에게 회원님의
              <br />
              전화번호와 생년월일이 전달됩니다.
              <br />
              봉사를 신청하시겠습니까?
            </>
          )
        }
        confirmText={
          effectiveParticipationAction === "CANCEL" ? "취소하기" : "확인"
        }
        isPending={participationMutation.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setActionError(null);
          participationMutation.mutate(undefined, {
            onSuccess: () => setConfirmOpen(false),
            onError: () => {
              setConfirmOpen(false);
              setActionError(
                "신청 상태를 변경하지 못했어요. 마감 또는 확정 상태를 확인해 주세요.",
              );
            },
          });
        }}
      />
    </PageContainer>
  );
}
