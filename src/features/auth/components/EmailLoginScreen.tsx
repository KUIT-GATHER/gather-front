import { ChevronLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router";

import { AuthLogo } from "@/features/auth/components/AuthLogo";
import { EmailLoginForm } from "@/features/auth/components/EmailLoginForm";

type LoginLocationState = {
  from?: string;
};

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

  return (
    <main className="min-h-dvh bg-bg px-6 pt-[calc(env(safe-area-inset-top)+56px)]">
      <button
        type="button"
        aria-label="뒤로가기"
        className="flex h-8 w-8 items-center justify-center"
        onClick={() => navigate("/login")}
      >
        <ChevronLeft className="h-7 w-7 text-text" />
      </button>

      <AuthLogo size="medium" className="mt-[86px]" />

      <EmailLoginForm
        className="mt-[54px]"
        onLoginSuccess={() => {
          navigate(redirectTo, { replace: true });
        }}
        onSignupClick={() => navigate("/signup")}
      />
    </main>
  );
}
