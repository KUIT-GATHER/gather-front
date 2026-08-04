import type { MeetingPost } from "@/features/team/types/team.types";

import { MeetingPostComment } from "./MeetingPostComment";
import { MeetingPostMainBoard } from "./MeetingPostMainBoard";

type MeetingPostDetailProps = {
  post: MeetingPost;
};

export function MeetingPostDetail({ post }: MeetingPostDetailProps) {
  return (
    <section className="px-5.5 pb-[calc(env(safe-area-inset-bottom)+7rem)]">
      <MeetingPostMainBoard post={post} />

      <MeetingPostComment post={post} />
    </section>
  );
}
