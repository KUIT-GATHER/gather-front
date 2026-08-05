import { TeamActivityAccessGate } from "@/features/team/components/activity/TeamActivityAccessGate";
import { TeamActivitySectionScreen } from "@/features/team/components/activity/TeamActivitySectionScreen";

export function TeamDetailActivityRecruitsPage() {
  return (
    <TeamActivityAccessGate>
      <TeamActivitySectionScreen
        title="내가 신청한 봉사"
        emptyMessage="아직 신청한 봉사가 없어요."
      />
    </TeamActivityAccessGate>
  );
}
