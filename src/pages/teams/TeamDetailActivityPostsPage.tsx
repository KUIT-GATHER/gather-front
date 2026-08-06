import { TeamActivityAccessGate } from "@/features/team/components/activity/TeamActivityAccessGate";
import { TeamActivityWrittenPostsScreen } from "@/features/team/components/activity/TeamActivityPostListScreen";

export function TeamDetailActivityPostsPage() {
  return (
    <TeamActivityAccessGate>
      <TeamActivityWrittenPostsScreen />
    </TeamActivityAccessGate>
  );
}
