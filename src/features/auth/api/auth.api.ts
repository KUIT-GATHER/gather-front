import { fetchClient } from "@/shared/api/fetchClient";

import type {
  ConfirmEmailVerificationRequest,
  ConfirmEmailVerificationResponse,
  AccountRecoveryEmailRequest,
  AccountRecoveryEmailResponse,
  KakaoLoginRequest,
  KakaoLoginResponse,
  KakaoSignupRequest,
  PasswordResetPermissionRequest,
  PasswordResetPermissionResponse,
  PasswordResetRequest,
  PhoneVerificationConfirmResponse,
  PhoneVerificationQrCodeResponse,
  PhoneVerificationStartRequest,
  PhoneVerificationStartResponse,
  SendEmailVerificationRequest,
  SendEmailVerificationResponse,
  SessionRestoreResponse,
  SignupRequest,
  SignupResponse,
  TokenResponse,
  WithdrawAccountResponse,
} from "@/features/auth/types/auth.types";

import type { LoginRequest } from "@/features/auth/schemas/login.schema";

const publicOptions = {
  skipAuth: true,
  withCredentials: false,
} as const;

const cookieAuthOptions = {
  skipAuth: true,
  withCredentials: true,
} as const;

export function startPhoneVerification(payload: PhoneVerificationStartRequest) {
  return fetchClient<PhoneVerificationStartResponse>(
    "/api/v1/auth/phone-verifications",
    {
      ...publicOptions,
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function createPhoneVerificationQrCode(verificationId: string) {
  return fetchClient<PhoneVerificationQrCodeResponse>(
    `/api/v1/auth/phone-verifications/${encodeURIComponent(verificationId)}/qr-code`,
    {
      ...publicOptions,
      method: "POST",
    },
  );
}

export function confirmPhoneVerification(verificationId: string) {
  return fetchClient<PhoneVerificationConfirmResponse>(
    `/api/v1/auth/phone-verifications/${encodeURIComponent(verificationId)}/confirm`,
    {
      ...publicOptions,
      method: "POST",
    },
  );
}

export function findAccountByPhoneVerification(
  payload: AccountRecoveryEmailRequest,
) {
  return fetchClient<AccountRecoveryEmailResponse>(
    "/api/v1/auth/account-recoveries/email",
    {
      ...publicOptions,
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function issuePasswordResetToken(
  payload: PasswordResetPermissionRequest,
) {
  return fetchClient<PasswordResetPermissionResponse>(
    "/api/v1/auth/account-recoveries/password",
    {
      ...publicOptions,
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function resetPassword(payload: PasswordResetRequest) {
  return fetchClient<null>("/api/v1/auth/account-recoveries/password/reset", {
    ...publicOptions,
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function sendEmailVerification(payload: SendEmailVerificationRequest) {
  return fetchClient<SendEmailVerificationResponse>(
    "/api/v1/auth/email-verifications",
    {
      ...publicOptions,
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function confirmEmailVerification(
  payload: ConfirmEmailVerificationRequest,
) {
  return fetchClient<ConfirmEmailVerificationResponse>(
    "/api/v1/auth/email-verifications/confirm",
    {
      ...publicOptions,
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function signup(payload: SignupRequest) {
  return fetchClient<SignupResponse>("/api/v1/auth/signup", {
    ...cookieAuthOptions,
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload: LoginRequest) {
  return fetchClient<TokenResponse>("/api/v1/auth/login", {
    ...cookieAuthOptions,
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function kakaoLogin(payload: KakaoLoginRequest) {
  return fetchClient<KakaoLoginResponse>("/api/v1/auth/kakao/login", {
    ...cookieAuthOptions,
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function kakaoSignup(payload: KakaoSignupRequest, signupToken: string) {
  return fetchClient<TokenResponse>("/api/v1/auth/kakao/signup", {
    ...cookieAuthOptions,
    method: "POST",
    headers: {
      "X-Signup-Token": signupToken,
    },
    body: JSON.stringify(payload),
  });
}

export function reissue() {
  return fetchClient<TokenResponse>("/api/v1/auth/reissue", {
    ...cookieAuthOptions,
    method: "POST",
  });
}

export function restoreSession() {
  return fetchClient<SessionRestoreResponse>("/api/v1/auth/session/restore", {
    ...cookieAuthOptions,
    method: "POST",
  });
}

export function logout() {
  return fetchClient<null>("/api/v1/auth/logout", {
    ...cookieAuthOptions,
    method: "POST",
  });
}

export function withdrawAccount() {
  return fetchClient<WithdrawAccountResponse>("/api/v1/users/me", {
    method: "DELETE",
    withCredentials: true,
    signal: AbortSignal.timeout(10_000),
  });
}
