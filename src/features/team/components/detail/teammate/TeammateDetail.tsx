import type {
  MeetingHome,
  TeammateViewerRole,
} from "@/features/team/types/team.types";

import { SharedHeader } from "../shared/SharedHeader";
import { SharedHomeContent } from "../shared/SharedHomeContent";

type TeammateDetailProps = {
  home: MeetingHome;
  viewerRole: TeammateViewerRole;
};

export function TeammateDetail({ home, viewerRole }: TeammateDetailProps) {
  return (
    <>
      <SharedHeader title={home.name} viewerRole={viewerRole} />
      <SharedHomeContent home={home} />
    </>
  );
}
