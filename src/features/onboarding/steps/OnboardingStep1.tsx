import {
  OnboardingStepControls,
  type OnboardingStepProps,
} from "@/features/onboarding/components/OnboardingStepControls";
import { OnboardingMessage } from "@/features/onboarding/components/OnboardingMessage";

export function OnboardingStep1({
  onNext,
  onStepChange,
}: OnboardingStepProps) {
  return (
    <>
      <div className="flex-1" />

      <OnboardingMessage
        title={"봉사시간이 필요한데,\n어디서 찾아야 할지 막막하셨죠"}
        description={
          "여러 사이트에 흩어진 봉사 공고를\n한곳에서 빠르게 확인해요."
        }
      />

      <OnboardingStepControls
        currentStep={1}
        onNext={onNext}
        onStepChange={onStepChange}
      />
    </>
  );
}
