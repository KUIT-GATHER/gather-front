import { useMutation } from "@tanstack/react-query";

import { login } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/features/auth/store/auth.store";

export function useLoginMutation() {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    mutationFn: login,
    onSuccess: (tokens) => {
      setAccessToken(tokens.accessToken);
    },
  });
}
