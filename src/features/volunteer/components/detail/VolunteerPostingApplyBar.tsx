import type { VolunteerPostingParticipationAction } from "@/features/volunteer/types/volunteer.types";
import Button from "@/shared/ui/Button";

type VolunteerPostingApplyBarProps = {
  participationAction: VolunteerPostingParticipationAction;
  disabled: boolean;
  isApplyPending: boolean;
  isCancelPending: boolean;
  isCompletePending: boolean;
  errorMessage?: string;
  onApply: () => void;
  onCancel: () => void;
  onComplete: () => void;
};

export function VolunteerPostingApplyBar({
  participationAction,
  disabled,
  isApplyPending,
  isCancelPending,
  isCompletePending,
  errorMessage,
  onApply,
  onCancel,
  onComplete,
}: VolunteerPostingApplyBarProps) {
  const isPending = isApplyPending || isCancelPending || isCompletePending;
  const canApply = participationAction === "APPLY";
  const canCancel = participationAction === "CANCEL";
  const canComplete = participationAction === "COMPLETE";
  const canClick = canApply || canComplete;
  const isButtonDisabled = isPending || !canClick || (canApply && disabled);
  const isNeutralButton = canCancel || participationAction === "NONE";
  const buttonVariant =
    participationAction === "COMPLETE"
      ? "dark"
      : isNeutralButton
        ? "neutral"
        : "primary";
  const buttonClassName =
    participationAction === "COMPLETE"
      ? "mx-auto h-12 max-w-[315px] text-[18px] font-semibold disabled:bg-icon disabled:text-text2"
      : isNeutralButton
        ? "mx-auto h-12 max-w-[315px] text-[18px] font-semibold"
        : "mx-auto h-12 max-w-[315px] text-[18px] font-semibold";

  const buttonLabel = (() => {
    if (isApplyPending) {
      return "신청 중";
    }

    if (isCancelPending) {
      return "신청 취소 중";
    }

    if (isCompletePending) {
      return "완료 처리 중";
    }

    switch (participationAction) {
      case "APPLY":
        return disabled ? "신청 마감된 공고예요" : "신청하기";
      case "CANCEL":
        return "이미 신청한 봉사입니다";
      case "COMPLETE":
        return "봉사 완료";
      default:
        return "완료된 봉사입니다";
    }
  })();

  return (
    <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-app -translate-x-1/2 bg-bg px-5.5 pt-3 pb-[calc(env(safe-area-inset-bottom)+36px)]">
      {errorMessage ? (
        <p
          role="alert"
          className="mb-2 text-center text-body-14 text-point-red"
        >
          {errorMessage}
        </p>
      ) : null}
      <Button
        fullWidth
        variant={buttonVariant}
        disabled={isButtonDisabled}
        onClick={canCancel ? onCancel : canComplete ? onComplete : onApply}
        className={buttonClassName}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
