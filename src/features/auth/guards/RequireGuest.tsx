import { Navigate, Outlet, useLocation } from "react-router";

import { useAuthStore } from "@/features/auth/store/auth.store";
import LoadingState from "@/shared/ui/LoadingState";

function getSafeReturnPath(value: unknown) {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
    ? value
    : null;
}

export function RequireGuest() {
  const location = useLocation();
  const authInitialized = useAuthStore((state) => state.authInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!authInitialized) {
    return (
      <LoadingState
        className="min-h-dvh"
        label="로그인 정보를 확인하고 있습니다."
      />
    );
  }

  if (isAuthenticated) {
    const from = getSafeReturnPath(
      (location.state as { from?: unknown } | null)?.from,
    );

    return <Navigate to={from ?? "/home"} replace />;
  }

  return <Outlet />;
}
