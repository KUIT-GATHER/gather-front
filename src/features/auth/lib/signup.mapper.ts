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
  phoneVerificationId: string,
): CommonSignupRequest {
  if (values.gender === "" || values.activityRegionId === null) {
    throw new Error("Invalid signup form state");
  }

  return {
    name: values.name.trim(),
    birthDate: normalizeBirthDate(values.birthDate),
    gender: values.gender,
    phoneNumber: normalizePhoneNumber(values.phoneNumber),
    phoneVerificationId,
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
  phoneVerificationId: string,
  emailVerificationId: string,
): SignupRequest {
  return {
    ...toCommonSignupRequest(values, phoneVerificationId),
    email: normalizeEmail(values.email),
    emailVerificationId,
    password: values.password,
    passwordConfirm: values.passwordConfirm,
  };
}

export function toKakaoSignupRequest(
  values: KakaoSignupFormValues,
  phoneVerificationId: string,
): KakaoSignupRequest {
  return toCommonSignupRequest(values, phoneVerificationId);
}
