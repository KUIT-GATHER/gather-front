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

export type SignupRequest = {
  name: string;
  birthDate: string;
  gender: "MALE" | "FEMALE";
  phoneNumber: string;
  email: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
  introduction?: string | null;
  activityRegionIds: number[];
  interestCategoryIds: number[];
  serviceTermsAgreed: boolean;
  privacyPolicyAgreed: boolean;
  marketingAgreed: boolean;
};

export type SignupResponse = {
  userId: number;
  email: string;
  name: string;
  nickname: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type TokenResponse = {
  accessToken: string;
  tokenType: "Bearer";
};
