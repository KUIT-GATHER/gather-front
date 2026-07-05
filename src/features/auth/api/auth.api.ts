import { fetchClient } from "@/shared/api/fetchClient";

import type {
  ConfirmEmailVerificationRequest,
  ConfirmEmailVerificationResponse,
  LoginRequest,
  LogoutRequest,
  PhoneAvailabilityRequest,
  PhoneAvailabilityResponse,
  ReissueRequest,
  SendEmailVerificationRequest,
  SendEmailVerificationResponse,
  SignupRequest,
  SignupResponse,
  TokenResponse,
} from "@/features/auth/types/auth.types";

export function checkPhoneAvailability(payload: PhoneAvailabilityRequest) {
  return fetchClient<PhoneAvailabilityResponse>(
    "/api/v1/auth/phone-numbers/availability",
    {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    },
  );
}

export function sendEmailVerification(payload: SendEmailVerificationRequest) {
  return fetchClient<SendEmailVerificationResponse>(
    "/api/v1/auth/email-verifications",
    {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    },
  );
}

export function confirmEmailVerification(
  payload: ConfirmEmailVerificationRequest,
) {
  return fetchClient<ConfirmEmailVerificationResponse>(
    "/api/v1/auth/email-verifications/confirm",
    {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    },
  );
}

export function signup(payload: SignupRequest) {
  return fetchClient<SignupResponse>("/api/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export function login(payload: LoginRequest) {
  return fetchClient<TokenResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
    skipRefresh: true,
  });
}

export function reissue(payload: ReissueRequest) {
  return fetchClient<TokenResponse>("/api/v1/auth/reissue", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
    skipRefresh: true,
  });
}

export function logout(payload: LogoutRequest) {
  return fetchClient<null>("/api/v1/auth/logout", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
    skipRefresh: true,
  });
}
