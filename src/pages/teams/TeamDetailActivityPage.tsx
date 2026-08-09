import { TeamActivityAccessGate } from "@/features/team/components/activity/TeamActivityAccessGate";
import { TeamActivityHomeScreen } from "@/features/team/components/activity/TeamActivityHomeScreen";

export function TeamDetailActivityPage() {
  return (
    <TeamActivityAccessGate>
      <TeamActivityHomeScreen />
    </TeamActivityAccessGate>
  );
}
