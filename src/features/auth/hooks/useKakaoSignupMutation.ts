import { useMutation } from "@tanstack/react-query";

import { kakaoSignup } from "@/features/auth/api/auth.api";

import type { KakaoSignupRequest } from "@/features/auth/types/auth.types";

type KakaoSignupMutationVariables = {
  payload: KakaoSignupRequest;
  signupToken: string;
};

export function useKakaoSignupMutation() {
  return useMutation({
    mutationFn: ({ payload, signupToken }: KakaoSignupMutationVariables) =>
      kakaoSignup(payload, signupToken),
    meta: { errorMode: "silent" },
  });
}
