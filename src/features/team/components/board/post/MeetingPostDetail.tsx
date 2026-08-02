import type { MeetingPost } from "@/features/team/types/team.types";

import { MeetingPostComment } from "./MeetingPostComment";
import { MeetingPostMainBoard } from "./MeetingPostMainBoard";

type MeetingPostDetailProps = {
  post: MeetingPost;
};

export function MeetingPostDetail({ post }: MeetingPostDetailProps) {
  return (
    <section className="px-5.5 pt-2 pb-8">
      <MeetingPostMainBoard post={post} />

      <MeetingPostComment
        likeCount={post.likeCount}
        commentCount={post.commentCount}
      />
    </section>
  );
}
