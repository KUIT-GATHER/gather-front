import { useQuery } from "@tanstack/react-query";

import { teamQueries } from "@/features/team/api/team.queries";

type UseMeetingImagesQueryOptions = {
  enabled?: boolean;
};

export function useMeetingImagesQuery(
  meetingId: number,
  options: UseMeetingImagesQueryOptions = {},
) {
  return useQuery({
    ...teamQueries.images(meetingId),
    enabled: options.enabled,
  });
}
