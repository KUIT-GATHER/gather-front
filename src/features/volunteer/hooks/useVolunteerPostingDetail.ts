import { useQuery } from "@tanstack/react-query";

import { getVolunteerPosting } from "@/features/volunteer/api/volunteerApi";

export const volunteerPostingKeys = {
  all: ["volunteerPostings"] as const,
  lists: () => [...volunteerPostingKeys.all, "list"] as const,
  details: () => [...volunteerPostingKeys.all, "detail"] as const,
  detail: (postingId: number | undefined) =>
    [...volunteerPostingKeys.details(), postingId] as const,
};

function isValidPostingId(postingId: number | undefined): postingId is number {
  return (
    typeof postingId === "number" && Number.isFinite(postingId) && postingId > 0
  );
}

export function useVolunteerPostingDetail(postingId: number | undefined) {
  const enabled = isValidPostingId(postingId);

  return useQuery({
    queryKey: volunteerPostingKeys.detail(postingId),
    queryFn: () => {
      if (!isValidPostingId(postingId)) {
        throw new Error("Invalid volunteer posting id.");
      }

      return getVolunteerPosting(postingId);
    },
    enabled,
  });
}
