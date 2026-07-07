import { useState } from "react";
import { useNavigate } from "react-router";

import { OnboardingLayout } from "@/features/onboarding/components/OnboardingLayout";
import type { OnboardingStep } from "@/features/onboarding/components/OnboardingStepControls";
import { OnboardingStep1 } from "@/features/onboarding/steps/OnboardingStep1";
import { OnboardingStep2 } from "@/features/onboarding/steps/OnboardingStep2";
import { OnboardingStep3 } from "@/features/onboarding/steps/OnboardingStep3";
import { OnboardingStep4 } from "@/features/onboarding/steps/OnboardingStep4";
import { OnboardingStep5 } from "@/features/onboarding/steps/OnboardingStep5";
import { useAuthStore } from "@/features/auth/store/auth.store";

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>(1);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const exitOnboarding = () => {
    navigate(isAuthenticated ? "/home" : "/login", { replace: true });
  };

  return (
    <OnboardingLayout onSkip={exitOnboarding}>
      {step === 1 && (
        <OnboardingStep1 onNext={() => setStep(2)} />
      )}

      {step === 2 && (
        <OnboardingStep2 onNext={() => setStep(3)} />
      )}

      {step === 3 && (
        <OnboardingStep3 onNext={() => setStep(4)} />
      )}

      {step === 4 && (
        <OnboardingStep4 onNext={() => setStep(5)} />
      )}

      {step === 5 && <OnboardingStep5 onNext={exitOnboarding} />}
    </OnboardingLayout>
  );
}
