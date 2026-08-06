import { useQuery } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router";

import { MeetingPostEditorScreen } from "@/features/team/components/board/create/MeetingPostEditorScreen";
import { teamQueries } from "@/features/team/api/team.queries";
import { getWritableMeetingPostTypes } from "@/features/team/lib/meetingPostPermissions";
import type { EditableMeetingPostType } from "@/features/team/types/meetingPost.types";
import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";

const postTypeByParam: Record<string, EditableMeetingPostType> = {
  notice: "NOTICE",
  review: "REVIEW",
  free: "FREE",
};

export function TeamPostEditorPage() {
  const { meetingId, isJoined, isHost } = useTeamDetailContext();
  const { postType, postId } = useParams();
  const parsedPostId = Number(postId);
  const editing = Number.isInteger(parsedPostId) && parsedPostId > 0;
  const postQuery = useQuery({
    ...teamQueries.post(meetingId, editing ? parsedPostId : 0),
    enabled: editing,
  });
  const resolvedType = editing
    ? postQuery.data?.type
    : postType
      ? postTypeByParam[postType]
      : undefined;
  const writable = resolvedType
    ? getWritableMeetingPostTypes(isHost).includes(resolvedType)
    : false;

  if (!isJoined) return <Navigate to={`/teams/${meetingId}/posts`} replace />;
  if (editing && postQuery.isLoading)
    return <LoadingState className="min-h-dvh" label="게시글을 불러오는 중" />;
  if (editing && (postQuery.isError || !postQuery.data))
    return (
      <ErrorState className="min-h-dvh" title="게시글을 불러오지 못했어요" />
    );
  if (editing && !postQuery.data?.canEdit)
    return <ErrorState className="min-h-dvh" title="수정할 권한이 없어요" />;
  if (!resolvedType || resolvedType === "RECRUIT" || !writable)
    return (
      <ErrorState
        className="min-h-dvh"
        title="작성할 수 없는 게시글 유형이에요"
        description="게시글 유형과 권한을 확인해 주세요."
      />
    );

  return (
    <MeetingPostEditorScreen
      meetingId={meetingId}
      postType={resolvedType}
      post={postQuery.data}
    />
  );
}
