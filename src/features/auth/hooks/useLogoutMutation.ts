import { useMutation } from "@tanstack/react-query";

import { logout } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/features/auth/store/auth.store";

export function useLogoutMutation() {
  const getRefreshToken = useAuthStore((state) => state.getRefreshToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: async () => {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        return null;
      }

      return logout({ refreshToken });
    },
    onSettled: () => {
      clearAuth();
    },
  });
}
