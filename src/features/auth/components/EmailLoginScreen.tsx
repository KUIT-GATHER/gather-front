import { ChevronLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router";

import { AuthLogo } from "@/features/auth/components/AuthLogo";
import { EmailLoginForm } from "@/features/auth/components/EmailLoginForm";
import IconButton from "@/shared/ui/IconButton";
import PageContainer from "@/shared/ui/PageContainer";

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
      className="flex min-h-dvh flex-col overflow-y-auto px-6 pt-[calc(env(safe-area-inset-top)+clamp(1.25rem,6dvh,3.5rem))] pb-[calc(env(safe-area-inset-bottom)+2rem)]"
    >
      <IconButton
        label="뒤로가기"
        icon={<ChevronLeft className="h-7 w-7 text-text" />}
        onClick={() => navigate("/login")}
      />

      <div className="flex flex-1 flex-col">
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
