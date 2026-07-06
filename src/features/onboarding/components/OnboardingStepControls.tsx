import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/Button";

const ONBOARDING_STEPS = [1, 2, 3, 4, 5] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export type OnboardingStepProps = {
  onNext: () => void;
  onStepChange: (step: OnboardingStep) => void;
};

type OnboardingStepControlsProps = {
  currentStep: OnboardingStep;
} & OnboardingStepProps;

export function OnboardingStepControls({
  currentStep,
  onNext,
  onStepChange,
}: OnboardingStepControlsProps) {
  const isLastStep = currentStep === 5;

  return (
    <>
      <nav className="mt-14 flex h-2 items-center justify-center gap-2">
        {ONBOARDING_STEPS.map((stepNumber) => {
          const isCurrent = stepNumber === currentStep;

          return (
            <button
              key={stepNumber}
              type="button"
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                isCurrent
                  ? "w-5 bg-point-green"
                  : "w-2 bg-[#DCEEDF] hover:bg-point-green/60",
              )}
              onClick={() => onStepChange(stepNumber)}
            />
          );
        })}
      </nav>

      <Button
        fullWidth
        size="large"
        className="mt-5 h-12 bg-[#56C987] text-base font-normal"
        onClick={onNext}
      >
        {isLastStep ? "회원가입 하기" : "다음"}
      </Button>
    </>
  );
}
