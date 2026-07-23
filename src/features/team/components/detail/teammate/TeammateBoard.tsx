import type { TeammateViewerRole } from "@/features/team/types/team.types";

type TeammateBoardProps = {
  viewerRole: TeammateViewerRole;
};

export function TeammateBoard({ viewerRole }: TeammateBoardProps) {
  return (
    <section
      aria-label={viewerRole === "leader" ? "팀장 게시판" : "팀원 게시판"}
    />
  );
}
