import { useQuery } from "@tanstack/react-query";

import { volunteerPostingQueries } from "@/features/volunteer/api/volunteer.queries";

export function useVolunteerPostingDetail(postingId: number) {
  return useQuery(volunteerPostingQueries.detail(postingId));
}
