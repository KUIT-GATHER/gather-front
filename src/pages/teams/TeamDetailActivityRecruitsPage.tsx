import { TeamActivityAccessGate } from "@/features/team/components/activity/TeamActivityAccessGate";
import { TeamActivityAppliedRecruitsScreen } from "@/features/team/components/activity/TeamActivityAppliedRecruitsScreen";

export function TeamDetailActivityRecruitsPage() {
  return (
    <TeamActivityAccessGate>
      <TeamActivityAppliedRecruitsScreen />
    </TeamActivityAccessGate>
  );
}
