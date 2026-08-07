import { Navigate } from "react-router";

import { TeamInfoEditScreen } from "@/features/team/components/settings/TeamInfoEditScreen";
import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";

export function TeamInfoEditPage() {
  const { home, detail, isHost } = useTeamDetailContext();
  if (!isHost) return <Navigate to={`/teams/${home.meetingId}`} replace />;
  return <TeamInfoEditScreen home={home} detail={detail} />;
}
