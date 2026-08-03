import type { MeetingPostComment as MeetingPostCommentType } from "@/features/team/types/team.types";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";

import { MeetingPostCommentItem } from "./MeetingPostCommentItem";

type MeetingPostCommentListProps = {
  meetingId: number;
  postId: number;
  comments: MeetingPostCommentType[];
  isInitialLoading: boolean;
  isInitialError: boolean;
  isEmpty: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  onFetchNextPage: () => void;
  onLoadMoreElementChange: (element: HTMLDivElement | null) => void;
};

export function MeetingPostCommentList({
  meetingId,
  postId,
  comments,
  isInitialLoading,
  isInitialError,
  isEmpty,
  isFetchingNextPage,
  isFetchNextPageError,
  onFetchNextPage,
  onLoadMoreElementChange,
}: MeetingPostCommentListProps) {
  if (isInitialLoading) {
    return <LoadingState label="댓글을 불러오는 중" className="min-h-32" />;
  }

  if (isInitialError) {
    return (
      <ErrorState
        title="댓글을 불러오지 못했어요"
        description="잠시 후 다시 확인해 주세요."
        className="min-h-32 justify-center"
      />
    );
  }

  if (isEmpty) {
    return (
      <p className="py-8 text-center text-[15px] leading-5 font-medium text-text-gray-300">
        아직 댓글이 없습니다.
      </p>
    );
  }

  if (comments.length === 0) {
    return null;
  }

  return (
    <>
      <ul>
        {comments.map((comment) => (
          <MeetingPostCommentItem
            key={comment.commentId}
            meetingId={meetingId}
            postId={postId}
            comment={comment}
          />
        ))}
      </ul>

      <div ref={onLoadMoreElementChange} aria-hidden="true" className="h-1" />

      {isFetchingNextPage ? (
        <LoadingState label="댓글을 더 불러오는 중" className="min-h-20" />
      ) : null}

      {isFetchNextPageError ? (
        <div className="py-5 text-center">
          <p className="text-sm text-text-gray-400">
            댓글을 더 불러오지 못했어요.
          </p>
          <button
            type="button"
            className="mt-2 rounded-lg px-3 py-2 text-sm font-medium text-button focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
            onClick={onFetchNextPage}
          >
            다시 시도
          </button>
        </div>
      ) : null}
    </>
  );
}
