import { Navigate, useLocation } from "react-router";

import { GuestBoard } from "@/features/team/components/detail/guest/GuestBoard";
import { SharedMeetingBoard } from "@/features/team/components/detail/shared/SharedMeetingBoard";
import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";
import LoadingState from "@/shared/ui/LoadingState";

export function TeamDetailPostsPage() {
  const location = useLocation();
  const { authInitialized, home, isAuthenticated, isJoined } =
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
    return <GuestBoard home={home} />;
  }

  return (
    <SharedMeetingBoard
      meetingId={home.meetingId}
      meetingName={home.name}
      canWrite
    />
  );
}
