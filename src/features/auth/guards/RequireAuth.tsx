import { Navigate, Outlet, useLocation } from "react-router";

import { useAuthStore } from "@/features/auth/store/auth.store";
import LoadingState from "@/shared/ui/LoadingState";

export function RequireAuth() {
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
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname + location.search + location.hash,
        }}
      />
    );
  }

  return <Outlet />;
}
