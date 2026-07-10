import {
  normalizeBirthDate,
  normalizeEmail,
  normalizePhoneNumber,
} from "@/features/auth/lib/signupFormatters";
import type { SignupFormValues } from "@/features/auth/schemas/signup.schema";
import type { SignupRequest } from "@/features/auth/types/auth.types";

export function toSignupRequest(values: SignupFormValues): SignupRequest {
  if (values.gender === "" || values.activityRegionId === null) {
    throw new Error("Invalid signup form state");
  }

  return {
    name: values.name.trim(),
    birthDate: normalizeBirthDate(values.birthDate),
    gender: values.gender,
    phoneNumber: normalizePhoneNumber(values.phoneNumber),
    email: normalizeEmail(values.email),
    password: values.password,
    passwordConfirm: values.passwordConfirm,
    nickname: values.nickname.trim(),
    introduction: values.introduction.trim() || null,
    activityRegionId: values.activityRegionId,
    interestCategoryIds: values.interestCategoryIds,
    serviceTermsAgreed: values.serviceTermsAgreed,
    privacyPolicyAgreed: values.privacyPolicyAgreed,
    marketingAgreed: values.marketingAgreed,
  };
}
