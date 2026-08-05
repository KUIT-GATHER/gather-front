import { useInfiniteQuery } from "@tanstack/react-query";

import { volunteerPostingQueries } from "@/features/volunteer/api/volunteer.queries";
import type { VolunteerPostingInfiniteParams } from "@/features/volunteer/types/volunteer.types";

export function useInfiniteBookmarkedVolunteerPostingsQuery(
  params: VolunteerPostingInfiniteParams = {},
  enabled = true,
) {
  return useInfiniteQuery({
    ...volunteerPostingQueries.infiniteBookmarks(params),
    enabled,
  });
}
