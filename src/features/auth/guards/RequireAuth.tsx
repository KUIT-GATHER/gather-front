import { Navigate, Outlet, useLocation } from "react-router";

import { useAuthStore } from "@/features/auth/store/auth.store";

export function RequireAuth() {
  const location = useLocation();

  const authInitialized = useAuthStore(
    (state) => state.authInitialized,
  );
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  );

  if (!authInitialized) {
    return null; // TODO: 로딩 스피너 컴포넌트로 교체
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname +
            location.search +
            location.hash,
        }}
      />
    );
  }

  return <Outlet />;
}