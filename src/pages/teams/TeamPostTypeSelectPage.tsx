import { Navigate } from "react-router";

import { MeetingPostTypeSelectScreen } from "@/features/team/components/board/create/MeetingPostTypeSelectScreen";
import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";

export function TeamPostTypeSelectPage() {
  const { meetingId, isJoined, isHost } = useTeamDetailContext();
  if (!isJoined) return <Navigate to={`/teams/${meetingId}/posts`} replace />;
  return <MeetingPostTypeSelectScreen meetingId={meetingId} isHost={isHost} />;
}
