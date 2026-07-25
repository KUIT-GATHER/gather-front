import type { PostingCategory } from "@/features/category/types/postingCategory.types";

export type PhoneAvailabilityRequest = {
  phoneNumber: string;
};

export type PhoneAvailabilityResponse = {
  phoneNumber: string;
  available: boolean;
};

export type SendEmailVerificationRequest = {
  email: string;
};

export type SendEmailVerificationResponse = {
  email: string;
  expiresAt: string;
  message: string;
};

export type ConfirmEmailVerificationRequest = {
  email: string;
  code: string;
};

export type ConfirmEmailVerificationResponse = {
  email: string;
  verified: boolean;
  verifiedAt: string;
};

export type EmailSignupRequest = {
  name: string;
  birthDate: string;
  gender: "MALE" | "FEMALE";
  phoneNumber: string;
  nickname: string;
  introduction?: string | null;
  activityRegionId: number;
  interestCategories: PostingCategory[];
  serviceTermsAgreed: boolean;
  privacyPolicyAgreed: boolean;
  marketingAgreed: boolean;
  email: string;
  password: string;
  passwordConfirm: string;
};

// 기존 공개 타입 이름은 이메일 회원가입 요청을 가리키도록 유지한다.
export type SignupRequest = EmailSignupRequest;

export type CommonSignupRequest = {
  name: string;
  birthDate: string;
  gender: "MALE" | "FEMALE";
  phoneNumber: string;
  nickname: string;
  introduction?: string | null;
  activityRegionId: number;
  interestCategories: PostingCategory[];
  serviceTermsAgreed: boolean;
  privacyPolicyAgreed: boolean;
  marketingAgreed: boolean;
};

export type KakaoSignupRequest = CommonSignupRequest;

export type SignupResponse = {
  userId: number;
  email: string;
  name: string;
  nickname: string;
};

export type TokenResponse = {
  accessToken: string;
  tokenType: "Bearer";
};

export type KakaoLoginRequest = {
  authorizationCode: string;
  redirectUri: string;
};

export type KakaoLoginResponse =
  | {
      signupStatus: "LOGIN_COMPLETED";
      accessToken: string;
      tokenType: "Bearer";
    }
  | {
      signupStatus: "ADDITIONAL_INFO_REQUIRED";
      signupToken: string;
      profile: {
        nickname: string | null;
      };
    };
