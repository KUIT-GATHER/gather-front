import {
  signupCommonDefaultValues,
  signupCommonSchema,
} from "@/features/auth/schemas/signupCommon.schema";

import type { SignupCommonFormValues } from "@/features/auth/schemas/signupCommon.schema";

export const kakaoSignupSchema = signupCommonSchema;

export type KakaoSignupFormValues = SignupCommonFormValues;
export type KakaoSignupStepField = keyof KakaoSignupFormValues;

export function createKakaoSignupDefaultValues(
  initialNickname: string | null,
): KakaoSignupFormValues {
  return {
    ...signupCommonDefaultValues,
    nickname: initialNickname?.trim() ?? "",
  };
}
