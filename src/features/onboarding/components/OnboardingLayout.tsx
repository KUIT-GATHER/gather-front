import type { ReactNode } from "react";
import { OnboardingHeader } from "@/features/onboarding/components/OnboardingHeader";

type OnboardingLayoutProps = {
  children: ReactNode;
  onSkip: () => void;
};

export function OnboardingLayout({
  children,
  onSkip,
}: OnboardingLayoutProps) {
  return (
    <main className="relative flex min-h-dvh w-full overflow-hidden bg-text2">
      <OnboardingHeader onSkip={onSkip} />

      <div className="relative z-10 flex min-h-dvh w-full flex-col px-5 pt-[calc(env(safe-area-inset-top)+40px)] pb-[calc(env(safe-area-inset-bottom)+62px)]">
        {children}
      </div>
    </main>
  );
}
