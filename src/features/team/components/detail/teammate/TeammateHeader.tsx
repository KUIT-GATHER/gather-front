import type { TeammateViewerRole } from "@/features/team/types/team.types";

type TeammateHeaderProps = {
  title: string;
  viewerRole?: TeammateViewerRole;
};

export function TeammateHeader({ title, viewerRole }: TeammateHeaderProps) {
  return (
    <header>
      <h1>{title}</h1>
      {viewerRole ? (
        <span>{viewerRole === "leader" ? "리더" : "팀원"}</span>
      ) : null}
    </header>
  );
}
