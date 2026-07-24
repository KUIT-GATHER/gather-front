import {
  accountInfoFields,
  type EmailSignupStepField as EmailSignupFormField,
} from "@/features/auth/schemas/emailSignup.schema";
import {
  basicInfoFields,
  profileFields,
  termsFields,
  type SignupCommonStepField,
} from "@/features/auth/schemas/signupCommon.schema";

export const EMAIL_SIGNUP_STEP_ORDER = [
  "basic",
  "account",
  "profile",
  "terms",
] as const;

export type EmailSignupStep = (typeof EMAIL_SIGNUP_STEP_ORDER)[number];
export type EmailSignupStepField = EmailSignupFormField;

export const EMAIL_SIGNUP_STEP_FIELDS: Record<
  EmailSignupStep,
  readonly EmailSignupStepField[]
> = {
  basic: basicInfoFields,
  account: accountInfoFields,
  profile: profileFields,
  terms: termsFields,
};

export const KAKAO_SIGNUP_STEP_ORDER = ["basic", "profile", "terms"] as const;

export type KakaoSignupStep = (typeof KAKAO_SIGNUP_STEP_ORDER)[number];
export type KakaoSignupStepField = SignupCommonStepField;

export const KAKAO_SIGNUP_STEP_FIELDS: Record<
  KakaoSignupStep,
  readonly KakaoSignupStepField[]
> = {
  basic: basicInfoFields,
  profile: profileFields,
  terms: termsFields,
};
