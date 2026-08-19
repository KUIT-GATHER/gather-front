import { useQuery } from "@tanstack/react-query";

import { volunteerPostingQueries } from "../api/volunteer.queries";
import type { VolunteerPostingBaseParams } from "../types/volunteer.types";

export function useVolunteerPostingsQuery(
  params: VolunteerPostingBaseParams = {},
) {
  return useQuery(volunteerPostingQueries.list(params));
}
