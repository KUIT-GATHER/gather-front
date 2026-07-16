import type { ReactNode } from "react";

import { OnboardingHeader } from "@/features/onboarding/components/OnboardingHeader";
import PageContainer from "@/shared/ui/PageContainer";

type OnboardingLayoutProps = {
  children: ReactNode;
  onSkip: () => void;
};

export function OnboardingLayout({ children, onSkip }: OnboardingLayoutProps) {
  return (
    <PageContainer
      size="narrow"
      className="relative flex min-h-dvh overflow-hidden bg-text2 px-0"
    >
      <OnboardingHeader onSkip={onSkip} />

      <div className="relative z-10 flex min-h-dvh w-full flex-col px-5 pt-[calc(env(safe-area-inset-top)+40px)] pb-[calc(env(safe-area-inset-bottom)+36px)]">
        {children}
      </div>
    </PageContainer>
  );
}
