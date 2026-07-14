import {
  OnboardingStepControls,
  type OnboardingStepProps,
} from "@/features/onboarding/components/OnboardingStepControls";
import { OnboardingMessage } from "@/features/onboarding/components/OnboardingMessage";

export function OnboardingStep3({ onNext }: OnboardingStepProps) {
  return (
    <>
      <div className="flex-1" />

      <OnboardingMessage
        title={"혼자 가기 망설여진다면,\n함께 갈 팀을 찾아요"}
        description={
          "관심사가 비슷한 사람들과 팀을 만들고,\n함께 갈 봉사를 찾아볼 수 있어요."
        }
      />

      <OnboardingStepControls currentStep={3} onNext={onNext} />
    </>
  );
}
