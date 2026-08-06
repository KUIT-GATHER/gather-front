import { useState } from "react";

import CalendarIcon from "@/assets/volunteer/calender.svg";
import ClockIcon from "@/assets/volunteer/clock.svg";
import LocationIcon from "@/assets/volunteer/location.svg";
import { useMeetingRecruitApplicationCard } from "@/features/team/hooks/useMeetingRecruitApplicationCard";
import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/Button";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";

type MeetingRecruitApplicationCardProps = {
  meetingId: number;
  postId: number;
};

function MeetingRecruitApplicationError({ onRetry }: { onRetry: () => void }) {
  return (
    <section
      aria-label="모집 공고 신청 정보"
      className="mt-5 rounded-xl border border-stroke bg-white p-4"
    >
      <p className="text-[14px] leading-5 font-medium text-text-gray-400">
        모집 정보를 불러오지 못했어요.
      </p>
      <button
        type="button"
        className="mt-2 rounded-md text-[13px] leading-5 font-medium text-button underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
        onClick={onRetry}
      >
        다시 시도
      </button>
    </section>
  );
}

export function MeetingRecruitApplicationCard({
  meetingId,
  postId,
}: MeetingRecruitApplicationCardProps) {
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const {
    recruit,
    isLoading,
    isError,
    retryRecruit,
    activityDateLabel,
    applicationPeriodLabel,
    progress,
    canToggleParticipation,
    participationButtonLabel,
    isParticipationPending,
    isParticipationError,
    navigateToLinkedPosting,
    toggleParticipation,
  } = useMeetingRecruitApplicationCard(meetingId, postId);

  if (isLoading) {
    return null;
  }

  if (isError || !recruit) {
    return <MeetingRecruitApplicationError onRetry={retryRecruit} />;
  }

  const handleParticipationClick = () => {
    if (recruit.applied) {
      toggleParticipation();
      return;
    }

    setIsApplyDialogOpen(true);
  };

  const handleApplyConfirm = () => {
    toggleParticipation({
      onSettled: () => setIsApplyDialogOpen(false),
    });
  };

  return (
    <section
      aria-label="모집 공고 신청 정보"
      className="mt-5 rounded-[16px] border border-[#C5C5C5] bg-white px-4 py-5"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 text-[16px] leading-5 font-semibold text-text">
          {recruit.title}
        </h3>

        {navigateToLinkedPosting ? (
          <button
            type="button"
            className="shrink-0 text-[14px] leading-5 text-text-gray-400 underline underline-offset-2 transition hover:text-button focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
            onClick={navigateToLinkedPosting}
          >
            봉사 공고로 이동
          </button>
        ) : null}
      </div>

      <div className="mt-6.5">
        <h4 className="text-[16px] leading-5 font-medium text-text">
          봉사 일정 및 장소
        </h4>
        <div className="mt-3 flex min-w-0 items-center gap-2 text-[15px] leading-5 text-text">
          <img
            src={CalendarIcon}
            alt=""
            aria-hidden="true"
            className="size-4.5 shrink-0"
          />
          <span className="min-w-0 truncate">{activityDateLabel}</span>
        </div>
        <div className="mt-2 flex min-w-0 items-center gap-2 text-[15px] leading-5 text-text">
          <img
            src={LocationIcon}
            alt=""
            aria-hidden="true"
            className="size-4.5 shrink-0"
          />
          <span className="min-w-0 truncate">{recruit.place}</span>
        </div>
      </div>

      <div className="mt-6.5">
        <h4 className="text-[16px] leading-5 font-medium text-text">
          신청 기간
        </h4>
        <p className="mt-3 flex min-w-0 items-center gap-2 text-[15px] leading-5 text-text">
          <img
            src={ClockIcon}
            alt=""
            aria-hidden="true"
            className="size-4.5 shrink-0"
          />
          <span className="min-w-0 truncate">{applicationPeriodLabel}</span>
        </p>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-[16px] leading-5 font-medium text-text">
            참여 신청 현황
          </h4>
          <span className="shrink-0 text-[14px] leading-5 text-text">
            {recruit.appliedCount} / {recruit.maxParticipants}명
          </span>
        </div>

        <div
          role="progressbar"
          aria-label={`${recruit.title} 참여 신청 현황`}
          aria-valuemin={0}
          aria-valuemax={recruit.maxParticipants}
          aria-valuenow={recruit.appliedCount}
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#EEEEEC]"
        >
          <div
            className="h-full rounded-full bg-[#00C77A] transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Button
        fullWidth
        size="medium"
        variant={recruit.applied ? "dark" : "primary"}
        disabled={!canToggleParticipation || isParticipationPending}
        aria-pressed={recruit.applied}
        className={cn(
          "mt-5 h-11 rounded-lg text-[14px] leading-5 font-semibold",
          recruit.applied && "bg-icon",
        )}
        onClick={handleParticipationClick}
      >
        {participationButtonLabel}
      </Button>

      {isParticipationError ? (
        <p
          role="alert"
          className="mt-2 text-center text-[13px] leading-5 font-medium text-point-red"
        >
          신청 상태를 변경하지 못했어요. 다시 시도해 주세요.
        </p>
      ) : null}

      <ConfirmDialog
        open={isApplyDialogOpen}
        title={
          <>
            신청 시 모임장에게 회원님의
            <br />
            전화번호와 생년월일이 전달됩니다
            <br />
            봉사를 신청하시겠습니까?
          </>
        }
        cancelText="취소"
        confirmText="확인"
        confirmVariant="primary"
        isPending={isParticipationPending}
        onCancel={() => setIsApplyDialogOpen(false)}
        onConfirm={handleApplyConfirm}
      />
    </section>
  );
}
