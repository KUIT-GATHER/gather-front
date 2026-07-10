import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";

const stepMeta = {
  basic: { label: "1 /4 기본 정보", value: 25 },
  account: { label: "2 /4 계정 정보", value: 50 },
  profile: { label: "3 /4 프로필 생성", value: 75 },
  terms: { label: "4 /4 서비스 약관", value: 100 },
};

export type SignupStep = keyof typeof stepMeta;

type SignupShellProps = {
  step: SignupStep;
  onBack: () => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function SignupShell({
  step,
  onBack,
  children,
  footer,
  className,
}: SignupShellProps) {
  const meta = stepMeta[step];

  return (
    <PageContainer
      size="narrow"
      className={cn(
        "flex min-h-dvh flex-col bg-bg pb-[env(safe-area-inset-bottom)]",
        className,
      )}
    >
      <PageHeader title="회원가입" onBack={onBack} className="bg-bg" />

      <div
        role="progressbar"
        aria-label="회원가입 진행률"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={meta.value}
        className="mt-1 h-1.25 w-full overflow-hidden rounded-full bg-stroke"
      >
        <div
          className="h-full rounded-full bg-button"
          style={{ width: `${meta.value}%` }}
        />
      </div>

      <p className="mt-2 text-sm font-semibold leading-5 text-text-gray-100">
        {meta.label}
      </p>

      <div className="flex min-h-0 flex-1 flex-col pt-9">{children}</div>

      {footer ? (
        <div className="sticky bottom-0 z-10 mt-auto bg-bg pt-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
          {footer}
        </div>
      ) : null}
    </PageContainer>
  );
}
