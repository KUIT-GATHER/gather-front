import type { SignupStepField } from "@/features/auth/schemas/signup.schema";
import {
  accountInfoFields,
  basicInfoFields,
  profileFields,
  termsFields,
} from "@/features/auth/schemas/signup.schema";

export const SIGNUP_STEP_ORDER = [
  "basic",
  "account",
  "profile",
  "terms",
] as const;

export type SignupStep = (typeof SIGNUP_STEP_ORDER)[number];

export const SIGNUP_STEP_FIELDS: Record<
  SignupStep,
  readonly SignupStepField[]
> = {
  basic: basicInfoFields,
  account: accountInfoFields,
  profile: profileFields,
  terms: termsFields,
};

export type TermsDocumentType = "service" | "privacy" | "marketing";

export const TERMS_DOCUMENTS: Record<
  TermsDocumentType,
  { title: string; placeholder: string }
> = {
  service: {
    title: "서비스 이용약관",
    placeholder: "승인된 서비스 이용약관 본문이 필요합니다.",
  },
  privacy: {
    title: "개인정보 수집 및 이용 동의",
    placeholder: "승인된 개인정보 수집 및 이용 동의 본문이 필요합니다.",
  },
  marketing: {
    title: "맞춤형 봉사/이벤트 알림 수신 동의",
    placeholder: "승인된 알림 수신 동의 본문이 필요합니다.",
  },
};
