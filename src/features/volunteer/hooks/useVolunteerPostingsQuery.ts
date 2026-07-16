import { useQuery } from "@tanstack/react-query";

import { volunteerPostingQueries } from "../api/volunteer.queries";
import type { VolunteerPostingListParams } from "../types/volunteer.types";

export function useVolunteerPostingsQuery(
  params: VolunteerPostingListParams = {},
) {
  return useQuery(volunteerPostingQueries.list(params));
}
