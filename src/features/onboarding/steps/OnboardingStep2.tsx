import {
  OnboardingStepControls,
  type OnboardingStepProps,
} from "@/features/onboarding/components/OnboardingStepControls";
import { OnboardingMessage } from "@/features/onboarding/components/OnboardingMessage";

export function OnboardingStep2({ onNext }: OnboardingStepProps) {
  return (
    <>
      <div className="flex-1" />

      <OnboardingMessage
        title={"지역, 날짜, 분야별로\n한번에 찾아봐요!"}
        description={
          "내가 가능한 시간과 장소에 맞춰\n모집 중인 봉사를 빠르게 확인해요."
        }
      />

      <OnboardingStepControls currentStep={2} onNext={onNext} />
    </>
  );
}
