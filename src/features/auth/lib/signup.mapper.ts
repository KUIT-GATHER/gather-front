import {
  normalizeBirthDate,
  normalizeEmail,
  normalizePhoneNumber,
} from "@/features/auth/lib/signupFormatters";
import type { EmailSignupFormValues } from "@/features/auth/schemas/emailSignup.schema";
import type { KakaoSignupFormValues } from "@/features/auth/schemas/kakaoSignup.schema";
import type {
  CommonSignupRequest,
  KakaoSignupRequest,
  SignupRequest,
} from "@/features/auth/types/auth.types";

function toCommonSignupRequest(
  values: KakaoSignupFormValues,
): CommonSignupRequest {
  if (values.gender === "" || values.activityRegionId === null) {
    throw new Error("Invalid signup form state");
  }

  return {
    name: values.name.trim(),
    birthDate: normalizeBirthDate(values.birthDate),
    gender: values.gender,
    phoneNumber: normalizePhoneNumber(values.phoneNumber),
    nickname: values.nickname.trim(),
    introduction: values.introduction.trim() || null,
    activityRegionId: values.activityRegionId,
    interestCategories: values.interestCategories,
    serviceTermsAgreed: values.serviceTermsAgreed,
    privacyPolicyAgreed: values.privacyPolicyAgreed,
    marketingAgreed: values.marketingAgreed,
  };
}

export function toEmailSignupRequest(
  values: EmailSignupFormValues,
): SignupRequest {
  return {
    ...toCommonSignupRequest(values),
    email: normalizeEmail(values.email),
    password: values.password,
    passwordConfirm: values.passwordConfirm,
  };
}

export function toKakaoSignupRequest(
  values: KakaoSignupFormValues,
): KakaoSignupRequest {
  return toCommonSignupRequest(values);
}
