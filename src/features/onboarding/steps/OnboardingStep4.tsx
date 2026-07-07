import {
  OnboardingStepControls,
  type OnboardingStepProps,
} from "@/features/onboarding/components/OnboardingStepControls";
import { OnboardingMessage } from "@/features/onboarding/components/OnboardingMessage";

export function OnboardingStep4({
  onNext,
}: OnboardingStepProps) {
  return (
    <>
      <div className="flex-1" />

      <OnboardingMessage
        title={"활동할수록\n나의 조각이 채워져요"}
        description={
          "신청한 봉사와 참여 일정을 모아보고,\n활동 후 기록과 배지도 남겨요."
        }
      />

      <OnboardingStepControls currentStep={4} onNext={onNext} />
    </>
  );
}
