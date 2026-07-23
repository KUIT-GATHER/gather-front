import { useMutation } from "@tanstack/react-query";

import { kakaoLogin } from "@/features/auth/api/auth.api";

export function useKakaoLoginMutation() {
  return useMutation({
    mutationFn: kakaoLogin,
    meta: { errorMode: "silent" },
  });
}
