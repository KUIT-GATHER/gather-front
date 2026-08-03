import { useQuery } from "@tanstack/react-query";

import { volunteerPostingQueries } from "@/features/volunteer/api/volunteer.queries";

export function useVolunteerPostingDetail(postingId?: number) {
  const isValidPostingId =
    typeof postingId === "number" &&
    Number.isInteger(postingId) &&
    postingId > 0;

  return useQuery({
    ...volunteerPostingQueries.detail(postingId ?? 0),
    enabled: isValidPostingId,
  });
}
