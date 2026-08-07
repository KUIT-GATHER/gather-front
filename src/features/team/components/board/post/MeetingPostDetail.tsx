import type { MeetingPost } from "@/features/team/types/team.types";

import { MeetingPostComment } from "./MeetingPostComment";
import { MeetingPostMainBoard } from "./MeetingPostMainBoard";
import { MeetingRecruitSummaryCard } from "@/features/team/components/recruit/MeetingRecruitSummaryCard";

type MeetingPostDetailProps = {
  post: MeetingPost;
};

export function MeetingPostDetail({ post }: MeetingPostDetailProps) {
  return (
    <section className="px-5.5 pb-[calc(env(safe-area-inset-bottom)+7rem)]">
      <MeetingPostMainBoard post={post} />

      {post.type === "RECRUIT" ? (
        <MeetingRecruitSummaryCard
          meetingId={post.meetingId}
          postId={post.postId}
        />
      ) : null}

      <MeetingPostComment post={post} />
    </section>
  );
}
