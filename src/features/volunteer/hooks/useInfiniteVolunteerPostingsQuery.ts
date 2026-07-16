import { useInfiniteQuery } from "@tanstack/react-query";

import { volunteerPostingQueries } from "../api/volunteer.queries";
import type { VolunteerPostingInfiniteParams } from "../types/volunteer.types";

export function useInfiniteVolunteerPostingsQuery(
  params: VolunteerPostingInfiniteParams = {},
) {
  return useInfiniteQuery(volunteerPostingQueries.infiniteList(params));
}
