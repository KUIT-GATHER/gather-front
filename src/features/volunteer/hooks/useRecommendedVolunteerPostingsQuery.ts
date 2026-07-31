import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth/store/auth.store";

import { volunteerPostingQueries } from "../api/volunteer.queries";

export function useRecommendedVolunteerPostingsQuery() {
  const authInitialized = useAuthStore((state) => state.authInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const scope = isAuthenticated ? "member" : "guest";

  return useQuery({
    ...volunteerPostingQueries.recommended(scope),
    enabled: authInitialized,
  });
}
