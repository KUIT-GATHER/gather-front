import { useMutation } from "@tanstack/react-query";

import { withdrawAccount } from "@/features/auth/api/auth.api";
import { clearAuthSession } from "@/features/auth/lib/clearAuthSession";

export function useWithdrawAccountMutation() {
  return useMutation({
    mutationFn: withdrawAccount,
    onSuccess: clearAuthSession,
  });
}
