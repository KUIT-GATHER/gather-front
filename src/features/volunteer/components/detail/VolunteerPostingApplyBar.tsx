import Button from "@/shared/ui/Button";

type VolunteerPostingApplyBarProps = {
  disabled?: boolean;
  isPending?: boolean;
  onApply?: () => void;
};

export function VolunteerPostingApplyBar({
  disabled = false,
  isPending = false,
  onApply,
}: VolunteerPostingApplyBarProps) {
  const isButtonDisabled = disabled || isPending;

  return (
    <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-app -translate-x-1/2 bg-bg px-5.5 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      <Button
        fullWidth
        disabled={isButtonDisabled}
        onClick={onApply}
        className="h-12 text-base font-normal"
      >
        {isPending ? "신청 중" : disabled ? "신청 경로 준비 중" : "신청하기"}
      </Button>
    </div>
  );
}
