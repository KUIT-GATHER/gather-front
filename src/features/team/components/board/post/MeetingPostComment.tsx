import { MeetingPostFooterActions } from "./MeetingPostFooterActions";

type MeetingPostCommentProps = {
  likeCount: number;
  commentCount: number;
};

export function MeetingPostComment({
  likeCount,
  commentCount,
}: MeetingPostCommentProps) {
  return (
    <section aria-label="게시글 반응 및 댓글">
      <MeetingPostFooterActions
        likeCount={likeCount}
        commentCount={commentCount}
      />
    </section>
  );
}
