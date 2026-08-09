import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { volunteerPostingQueries } from "@/features/volunteer/api/volunteer.queries";

export function useVolunteerPostingDetail(postingId?: number) {
  const authInitialized = useAuthStore((state) => state.authInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isValidPostingId =
    typeof postingId === "number" &&
    Number.isInteger(postingId) &&
    postingId > 0;
  const viewer = isAuthenticated ? "member" : "guest";

  return useQuery({
    ...volunteerPostingQueries.detail(postingId ?? 0, viewer),
    enabled: isValidPostingId && authInitialized,
  });
}
