import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";
import LoadingState from "@/shared/ui/LoadingState";

type TeamActivityAccessGateProps = {
  children: ReactNode;
};

export function TeamActivityAccessGate({
  children,
}: TeamActivityAccessGateProps) {
  const location = useLocation();
  const { authInitialized, isAuthenticated, isJoined, meetingId } =
    useTeamDetailContext();

  if (!authInitialized) {
    return (
      <LoadingState
        label="로그인 정보를 확인하고 있습니다."
        className="min-h-55"
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

  if (!isJoined) {
    return <Navigate to={`/teams/${meetingId}`} replace />;
  }

  return children;
}
