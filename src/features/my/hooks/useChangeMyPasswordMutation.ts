import { useMutation } from "@tanstack/react-query";

import { changeMyPassword } from "../api/myAccount.api";

export function useChangeMyPasswordMutation() {
  return useMutation({
    mutationKey: ["my-account", "change-password"] as const,
    mutationFn: changeMyPassword,
  });
}
