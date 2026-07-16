import { useMutation } from "@tanstack/react-query";

import { logout } from "@/features/auth/api/auth.api";
import { clearAuthSession } from "@/features/auth/lib/clearAuthSession";

export function useLogoutMutation() {
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuthSession();
    },
  });
}
