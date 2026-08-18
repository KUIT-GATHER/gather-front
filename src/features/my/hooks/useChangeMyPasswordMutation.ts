import { useMutation } from "@tanstack/react-query";

import { clearAuthSession } from "@/features/auth/lib/clearAuthSession";

import { changeMyPassword } from "../api/myAccount.api";

type UseChangeMyPasswordMutationOptions = {
  onSuccess?: () => void;
};

export function useChangeMyPasswordMutation(
  options: UseChangeMyPasswordMutationOptions = {},
) {
  return useMutation({
    mutationKey: ["my-account", "change-password"] as const,
    mutationFn: changeMyPassword,
    onSuccess: () => {
      clearAuthSession();
      queueMicrotask(() => {
        options.onSuccess?.();
      });
    },
  });
}
