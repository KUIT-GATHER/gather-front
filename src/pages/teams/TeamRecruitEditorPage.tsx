import { useQuery } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router";

import { teamQueries } from "@/features/team/api/team.queries";
import { MeetingRecruitFormScreen } from "@/features/team/components/recruit/MeetingRecruitFormScreen";
import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";

export function TeamRecruitEditorPage() {
  const { meetingId, detail, isHost } = useTeamDetailContext();
  const { postId } = useParams();
  const parsedPostId = Number(postId);
  const editing = Number.isInteger(parsedPostId) && parsedPostId > 0;
  const query = useQuery({
    ...teamQueries.recruit(meetingId, editing ? parsedPostId : 0),
    enabled: isHost && editing,
  });
  if (!isHost) return <Navigate to={`/teams/${meetingId}/posts`} replace />;
  if (!editing && detail.volunteerPostingId !== null)
    return <Navigate to={`/teams/${meetingId}/posts`} replace />;
  if (editing && query.isLoading)
    return (
      <LoadingState className="min-h-dvh" label="모집 공고를 불러오는 중" />
    );
  if (editing && (query.isError || !query.data))
    return (
      <ErrorState className="min-h-dvh" title="모집 공고를 불러오지 못했어요" />
    );
  if (editing && !query.data?.canEdit)
    return (
      <ErrorState className="min-h-dvh" title="수정할 수 없는 모집 공고예요" />
    );
  return (
    <MeetingRecruitFormScreen meetingId={meetingId} recruit={query.data} />
  );
}
