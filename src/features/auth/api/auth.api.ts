import { fetchClient } from "@/shared/api/fetchClient";

import type {
  ConfirmEmailVerificationRequest,
  ConfirmEmailVerificationResponse,
  LoginRequest,
  PhoneAvailabilityRequest,
  PhoneAvailabilityResponse,
  SendEmailVerificationRequest,
  SendEmailVerificationResponse,
  SignupRequest,
  SignupResponse,
  TokenResponse,
} from "@/features/auth/types/auth.types";

const publicOptions = {
  skipAuth: true,
  withCredentials: false,
} as const;

const cookieAuthOptions = {
  skipAuth: true,
  withCredentials: true,
} as const;

export function checkPhoneAvailability(payload: PhoneAvailabilityRequest) {
  return fetchClient<PhoneAvailabilityResponse>(
    "/api/v1/auth/phone-numbers/availability",
    {
      ...publicOptions,
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
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
    ...publicOptions,
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

export function reissue() {
  return fetchClient<TokenResponse>("/api/v1/auth/reissue", {
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
