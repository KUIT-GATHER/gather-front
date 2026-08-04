import { useMeetingPostCommentState } from "@/features/team/hooks/useMeetingPostCommentState";
import { useToggleMeetingPostLikeMutation } from "@/features/team/hooks/useMeetingPostMutations";
import type { MeetingPost } from "@/features/team/types/team.types";

import { MeetingPostCommentInput } from "./MeetingPostCommentInput";
import { MeetingPostCommentList } from "./MeetingPostCommentList";
import { MeetingPostFooterActions } from "./MeetingPostFooterActions";

type MeetingPostCommentProps = {
  post: MeetingPost;
};

export function MeetingPostComment({ post }: MeetingPostCommentProps) {
  const {
    canSubmitComment,
    commentContent,
    comments,
    fetchNextPage,
    isCreatingComment,
    isEmpty,
    isFetchNextPageError,
    isFetchingNextPage,
    isInitialError,
    isInitialLoading,
    setLoadMoreElement,
    setCommentContent,
    submitComment,
  } = useMeetingPostCommentState(post.meetingId, post.postId);
  const likeMutation = useToggleMeetingPostLikeMutation(
    post.meetingId,
    post.postId,
  );

  const handleLikeToggle = () => {
    if (likeMutation.isPending) {
      return;
    }

    likeMutation.mutate();
  };

  return (
    <section aria-label="게시글 반응 및 댓글">
      <MeetingPostFooterActions
        likeCount={post.likeCount}
        commentCount={post.commentCount}
        isLiked={post.liked}
        isLikePending={likeMutation.isPending}
        onLikeToggle={handleLikeToggle}
      />

      <div className="mt-2">
        <MeetingPostCommentList
          meetingId={post.meetingId}
          postId={post.postId}
          comments={comments}
          isInitialLoading={isInitialLoading}
          isInitialError={isInitialError}
          isEmpty={isEmpty}
          isFetchingNextPage={isFetchingNextPage}
          isFetchNextPageError={isFetchNextPageError}
          onFetchNextPage={() => void fetchNextPage()}
          onLoadMoreElementChange={setLoadMoreElement}
        />
      </div>

      <MeetingPostCommentInput
        value={commentContent}
        canSubmit={canSubmitComment}
        isPending={isCreatingComment}
        onChange={setCommentContent}
        onSubmit={submitComment}
      />
    </section>
  );
}
