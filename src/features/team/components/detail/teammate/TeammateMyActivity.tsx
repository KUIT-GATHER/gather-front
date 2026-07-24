import type { TeammateViewerRole } from "@/features/team/types/team.types";

type TeammateMyActivityProps = {
  viewerRole: TeammateViewerRole;
};

export function TeammateMyActivity({ viewerRole }: TeammateMyActivityProps) {
  return (
    <section
      aria-label={viewerRole === "leader" ? "팀장 나의 활동" : "팀원 나의 활동"}
    />
  );
}
