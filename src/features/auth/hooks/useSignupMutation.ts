import { useMutation } from "@tanstack/react-query";

import { signup } from "@/features/auth/api/auth.api";

export function useSignupMutation() {
  return useMutation({
    mutationFn: signup,
  });
}
