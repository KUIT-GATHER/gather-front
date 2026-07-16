import Button from "@/shared/ui/Button";

type VolunteerPostingApplyBarProps = {
  disabled?: boolean;
};

export function VolunteerPostingApplyBar({
  disabled = false,
}: VolunteerPostingApplyBarProps) {
  return (
    <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-app -translate-x-1/2 bg-bg px-5.5 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      <Button
        fullWidth
        disabled={disabled}
        className="h-12 text-base font-normal"
      >
        {disabled ? "신청 경로 준비 중" : "신청하기"}
      </Button>
    </div>
  );
}
