import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth/store/auth.store";

import { teamQueries } from "../api/team.queries";

export function useRecommendedMeetingsQuery() {
  const authInitialized = useAuthStore((state) => state.authInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const scope = isAuthenticated ? "member" : "guest";

  return useQuery({
    ...teamQueries.recommended(scope),
    enabled: authInitialized,
  });
}
