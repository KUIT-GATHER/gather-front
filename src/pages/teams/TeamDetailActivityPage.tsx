import { Navigate, useLocation } from "react-router";

import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";
import LoadingState from "@/shared/ui/LoadingState";

export function TeamDetailActivityPage() {
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

  return (
    <section className="px-5.5 py-4">
      <p className="flex min-h-75 items-center justify-center text-center text-[18px] leading-5 font-medium text-text-gray-400">
        현재 작성된 활동이 존재하지 않습니다
      </p>
    </section>
  );
}
