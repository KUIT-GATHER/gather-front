import { TeamActivityAccessGate } from "@/features/team/components/activity/TeamActivityAccessGate";
import { TeamActivityCommentedPostsScreen } from "@/features/team/components/activity/TeamActivityPostListScreen";

export function TeamDetailActivityCommentsPage() {
  return (
    <TeamActivityAccessGate>
      <TeamActivityCommentedPostsScreen />
    </TeamActivityAccessGate>
  );
}
