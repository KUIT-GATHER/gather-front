import type { PostingCategory } from "@/features/category/types/postingCategory.types";

export type PhoneVerificationStartRequest = {
  phoneNumber: string;
  purpose: PhoneVerificationPurpose;
};

export type PhoneVerificationPurpose =
  | "SIGNUP"
  | "FIND_ACCOUNT"
  | "RESET_PASSWORD";

export type PhoneVerificationStartResponse = {
  verificationId: string;
  receiverNumber: string;
  messageText: string;
  expiresAt: string;
};

export type PhoneVerificationQrCodeResponse = {
  qrCode: string;
};

export type PhoneVerificationStatus = "PENDING" | "VERIFIED";

export type PhoneVerificationConfirmResponse = {
  status: PhoneVerificationStatus;
};

export type AccountRecoveryEmailRequest = {
  phoneVerificationId: string;
};

export type AccountRecoveryEmailResponse =
  | {
      loginType: "EMAIL";
      email: string;
    }
  | {
      loginType: "KAKAO";
      email: null;
    };

export type PasswordResetPermissionRequest = {
  phoneVerificationId: string;
};

export type PasswordResetPermissionResponse = {
  passwordResetToken: string;
};

export type PasswordResetRequest = {
  passwordResetToken: string;
  password: string;
  passwordConfirm: string;
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

export type EmailVerificationProof = {
  email: string;
  emailVerificationId: string;
};

export type ConfirmEmailVerificationResponse = {
  email: string;
  verified: boolean;
  verifiedAt: string;
  emailVerificationId: string;
};

export type EmailSignupRequest = {
  name: string;
  birthDate: string;
  gender: "MALE" | "FEMALE";
  phoneNumber: string;
  phoneVerificationId: string;
  nickname: string;
  introduction?: string | null;
  activityRegionId: number;
  interestCategories: PostingCategory[];
  serviceTermsAgreed: boolean;
  privacyPolicyAgreed: boolean;
  marketingAgreed: boolean;
  email: string;
  emailVerificationId: string;
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
  phoneVerificationId: string;
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
  accessToken: string;
  tokenType: "Bearer";
};

export type TokenResponse = {
  accessToken: string;
  tokenType: "Bearer";
};

export type SessionRestoreResponse =
  | {
      authenticated: true;
      accessToken: string;
      tokenType: "Bearer";
    }
  | {
      authenticated: false;
      accessToken: null;
      tokenType: null;
    };

export type WithdrawAccountResponse = {
  status: "COMPLETED" | "ACCEPTED";
  occurredAt: string;
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
