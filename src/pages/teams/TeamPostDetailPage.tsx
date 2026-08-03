import { Navigate, useLocation, useParams } from "react-router";

import { MeetingPostDetail } from "@/features/team/components/board/post/MeetingPostDetail";
import { useMeetingPostQuery } from "@/features/team/hooks/useMeetingPostQuery";
import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";
import { ApiError } from "@/shared/api/apiError";
import { API_ERROR_CODE } from "@/shared/constants/apiErrorCode";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";

function getPostDetailError(error: unknown) {
  if (!(error instanceof ApiError)) {
    return {
      title: "게시글을 불러오지 못했어요",
      description: "잠시 후 다시 확인해 주세요.",
    };
  }

  if (error.code === API_ERROR_CODE.POST_NOT_FOUND) {
    return {
      title: "게시글을 찾을 수 없어요",
      description: "삭제되었거나 존재하지 않는 게시글이에요.",
    };
  }

  if (
    error.code === API_ERROR_CODE.POST_ACCESS_DENIED ||
    error.code === API_ERROR_CODE.MEETING_MEMBER_REQUIRED
  ) {
    return {
      title: "볼 수 없는 게시글이에요",
      description: "모임 가입자에게만 공개된 게시글이에요.",
    };
  }

  return {
    title: "게시글을 불러오지 못했어요",
    description: "잠시 후 다시 확인해 주세요.",
  };
}

export function TeamPostDetailPage() {
  const { postId } = useParams();
  const location = useLocation();
  const { authInitialized, isAuthenticated, meetingId } =
    useTeamDetailContext();
  const parsedPostId = Number(postId);
  const hasValidPostId = Number.isInteger(parsedPostId) && parsedPostId > 0;
  const safePostId = hasValidPostId ? parsedPostId : 0;
  const postQuery = useMeetingPostQuery(meetingId, safePostId, {
    enabled: hasValidPostId && authInitialized && isAuthenticated,
  });

  if (!authInitialized) {
    return (
      <LoadingState
        label="로그인 정보를 확인하고 있어요."
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

  if (!hasValidPostId) {
    return (
      <ErrorState
        title="잘못된 게시글 주소예요"
        description="게시글 주소를 다시 확인해 주세요."
        className="min-h-75 justify-center px-5.5"
      />
    );
  }

  if (postQuery.isLoading) {
    return <LoadingState label="게시글을 불러오는 중" className="min-h-75" />;
  }

  if (postQuery.isError) {
    const error = getPostDetailError(postQuery.error);

    return (
      <ErrorState
        title={error.title}
        description={error.description}
        className="min-h-75 justify-center px-5.5"
        primaryAction={{
          label: "다시 시도",
          onClick: () => {
            void postQuery.refetch();
          },
        }}
      />
    );
  }

  if (!postQuery.data) {
    return (
      <ErrorState
        title="게시글 정보가 없어요"
        description="요청한 게시글 정보를 찾을 수 없어요."
        className="min-h-75 justify-center px-5.5"
      />
    );
  }

  return <MeetingPostDetail post={postQuery.data} />;
}
