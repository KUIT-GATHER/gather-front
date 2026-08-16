import { useQuery } from "@tanstack/react-query";

import { volunteerPostingQueries } from "@/features/volunteer/api/volunteer.queries";
import type { VolunteerPostingMapParams } from "@/features/volunteer/types/volunteer.types";

export function useVolunteerPostingMapQuery(
  params: VolunteerPostingMapParams | undefined,
) {
  return useQuery({
    ...volunteerPostingQueries.map(params),
    enabled: params !== undefined,
  });
}
