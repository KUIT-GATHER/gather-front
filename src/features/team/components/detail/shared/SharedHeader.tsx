import type { TeammateViewerRole } from "@/features/team/types/team.types";

type SharedHeaderProps = {
  title: string;
  viewerRole?: TeammateViewerRole;
};

export function SharedHeader({ title, viewerRole }: SharedHeaderProps) {
  return (
    <header>
      <h1>{title}</h1>
      {viewerRole ? (
        <span>{viewerRole === "leader" ? "팀장" : "팀원"}</span>
      ) : null}
    </header>
  );
}
