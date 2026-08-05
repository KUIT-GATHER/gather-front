import { useInfiniteQuery } from "@tanstack/react-query";

import { teamQueries } from "@/features/team/api/team.queries";
import type { BookmarkedMeetingInfiniteParams } from "@/features/team/types/team.types";

export function useInfiniteBookmarkedMeetingsQuery(
  params: BookmarkedMeetingInfiniteParams = {},
  enabled = true,
) {
  return useInfiniteQuery({
    ...teamQueries.infiniteBookmarks(params),
    enabled,
  });
}
