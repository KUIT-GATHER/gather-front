import { useLocation, useNavigate } from "react-router";

import { AuthLogo } from "@/features/auth/components/login/AuthLogo";
import { EmailLoginForm } from "@/features/auth/components/login/EmailLoginForm";
import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";

type LoginLocationState = {
  from?: string;
  email?: string;
};

function isValidEmail(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 255 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
}

export function EmailLoginScreen() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as LoginLocationState | null;

  const redirectTo =
    typeof state?.from === "string" &&
    state.from.startsWith("/") &&
    !state.from.startsWith("//")
      ? state.from
      : "/home";

  const stateEmail = state?.email;

  const defaultEmail = isValidEmail(stateEmail)
    ? stateEmail.trim().toLowerCase()
    : "";

  return (
    <PageContainer
      size="narrow"
      className="flex min-h-dvh flex-col overflow-y-auto px-6 pb-[calc(env(safe-area-inset-bottom)+2rem)]"
    >
      <PageHeader
        onBack={() => navigate("/login")}
        className="shrink-0 bg-bg"
      />

      <div className="flex min-h-0 flex-1 flex-col">
        <AuthLogo
          size="medium"
          className="mt-[clamp(1.5rem,9.8dvh,5.375rem)]"
        />

        <EmailLoginForm
          className="mt-[clamp(1.5rem,6.2dvh,3.375rem)]"
          defaultEmail={defaultEmail}
          onLoginSuccess={() => {
            navigate(redirectTo, { replace: true });
          }}
          onSignupClick={() => navigate("/signup")}
        />
      </div>
    </PageContainer>
  );
}