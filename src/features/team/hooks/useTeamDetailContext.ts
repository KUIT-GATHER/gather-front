import { useContext } from "react";

import { TeamDetailContext } from "@/features/team/components/detail/TeamDetailContext";

export function useTeamDetailContext() {
  const context = useContext(TeamDetailContext);

  if (!context) {
    throw new Error(
      "useTeamDetailContext must be used within TeamDetailProvider.",
    );
  }

  return context;
}
