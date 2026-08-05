import { TeamActivityAccessGate } from "@/features/team/components/activity/TeamActivityAccessGate";
import { TeamActivitySectionScreen } from "@/features/team/components/activity/TeamActivitySectionScreen";

export function TeamDetailActivityCommentsPage() {
  return (
    <TeamActivityAccessGate>
      <TeamActivitySectionScreen
        title="댓글 단 게시글"
        emptyMessage="아직 댓글 단 게시글이 없어요."
      />
    </TeamActivityAccessGate>
  );
}
