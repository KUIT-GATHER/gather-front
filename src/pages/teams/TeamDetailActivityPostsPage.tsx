import { TeamActivityAccessGate } from "@/features/team/components/activity/TeamActivityAccessGate";
import { TeamActivitySectionScreen } from "@/features/team/components/activity/TeamActivitySectionScreen";

export function TeamDetailActivityPostsPage() {
  return (
    <TeamActivityAccessGate>
      <TeamActivitySectionScreen
        title="작성한 게시글"
        emptyMessage="아직 작성한 게시글이 없어요."
      />
    </TeamActivityAccessGate>
  );
}
