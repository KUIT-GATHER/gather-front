import {
  OnboardingStepControls,
  type OnboardingStepProps,
} from "@/features/onboarding/components/OnboardingStepControls";
import { OnboardingMessage } from "@/features/onboarding/components/OnboardingMessage";

export function OnboardingStep5({
  onNext,
  onStepChange,
}: OnboardingStepProps) {
  return (
    <>
      <div className="flex-1" />

      <OnboardingMessage
        title={"Gather와 함께 시작해요"}
        description={
          "나에게 맞는 첫 봉사를 찾아드릴게요!"
        }
      />

      <OnboardingStepControls
        currentStep={5}
        onNext={onNext}
        onStepChange={onStepChange}
      />
    </>
  );
}
