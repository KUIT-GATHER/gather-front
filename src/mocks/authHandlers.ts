import { HttpResponse, http } from "msw";

import regions from "./data/regions.json";
import {
  addMockUser,
  getMockUserById,
  getNextMockUserId,
  isWithdrawalCooldownActive,
  mockUsers,
  type MockUser,
  withdrawMockUser,
} from "./data/mockUsers";
import {
  createMockAccessToken,
  createMockRefreshToken,
  getMockUserId,
  getMockUserIdFromRefreshToken,
} from "./lib/mockAuth";

import { POSTING_CATEGORIES } from "@/features/category/types/postingCategory.types";

import type { PostingCategory } from "@/features/category/types/postingCategory.types";

import { getGatherApiUrl } from "./apiScope";

type SignupRequest = {
  name?: string;
  birthDate?: string;
  gender?: "MALE" | "FEMALE";
  phoneNumber?: string;
  phoneVerificationId?: string;
  email?: string;
  emailVerificationId?: string;
  password?: string;
  passwordConfirm?: string;
  nickname?: string;
  introduction?: string | null;
  activityRegionId?: number;
  interestCategories?: PostingCategory[];
  serviceTermsAgreed?: boolean;
  privacyPolicyAgreed?: boolean;
  marketingAgreed?: boolean;
};

type KakaoSignupRequest = Omit<
  SignupRequest,
  "email" | "password" | "passwordConfirm"
>;

type EmailVerification = {
  code: string;
  expiresAt: number;
  verificationId: string;
  verifiedAt: number | null;
  consumedAt: number | null;
};

type PhoneVerification = {
  phoneNumber: string;
  purpose: "SIGNUP" | "FIND_ACCOUNT" | "RESET_PASSWORD";
  messageText: string;
  expiresAt: number;
  verifiedAt: number | null;
  consumedAt: number | null;
};

const emailVerificationRequests = new Map<string, EmailVerification>();
const phoneVerificationRequests = new Map<string, PhoneVerification>();
const passwordResetTokens = new Map<
  string,
  { userId: number; expiresAt: number; consumedAt: number | null }
>();

const validRegionIds = new Set(regions.data.map((region) => region.id));
const validActivityRegionIds = new Set(
  regions.data
    .filter((region) => region.level === 1 || region.level === 2)
    .map((region) => region.id),
);
const validPostingCategories = new Set<PostingCategory>(POSTING_CATEGORIES);

const REFRESH_TOKEN_COOKIE_NAME = "gather_refresh_token";
const REFRESH_TOKEN_COOKIE_PATH = "/api/v1/auth";
const accountTerminationResults = new Map<
  number,
  { status: "COMPLETED" | "ACCEPTED"; occurredAt: string }
>();
const MOCK_KAKAO_SIGNUP_TOKEN = "mock-kakao-signup-token";
const MOCK_EXPIRED_KAKAO_SIGNUP_TOKEN = "mock-kakao-expired-signup-token";
const MOCK_ALREADY_REGISTERED_KAKAO_SIGNUP_TOKEN =
  "mock-kakao-already-registered-signup-token";
const MOCK_INVALID_KAKAO_SIGNUP_TOKEN = "mock-kakao-invalid-signup-token";
const MOCK_PHONE_RECEIVER_NUMBER = "00000000";
const MOCK_PHONE_MESSAGE_TEXT = "";
const MOCK_QR_CODE_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";

function normalizeMockPhoneNumber(phoneNumber?: string) {
  return phoneNumber?.replaceAll("-", "").replaceAll(" ", "");
}

function createMockVerificationId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  const suffix = Math.random().toString(16).slice(2, 14).padEnd(12, "0");

  return `00000000-0000-4000-8000-${suffix}`;
}

function createPhoneVerificationRequiredResponse() {
  return HttpResponse.json(
    {
      success: false,
      data: null,
      error: {
        code: "PHONE_VERIFICATION_REQUIRED",
        message: "휴대폰 인증이 필요합니다.",
      },
    },
    { status: 400 },
  );
}

function getValidPhoneVerification(
  verificationId: string,
  options: {
    phoneNumber?: string;
    purpose?: PhoneVerification["purpose"];
  } = {},
  now = Date.now(),
) {
  const verification = phoneVerificationRequests.get(verificationId);

  if (
    !verification ||
    (options.phoneNumber !== undefined &&
      verification.phoneNumber !== options.phoneNumber) ||
    (options.purpose !== undefined &&
      verification.purpose !== options.purpose) ||
    verification.verifiedAt === null ||
    verification.consumedAt !== null ||
    verification.expiresAt <= now
  ) {
    return null;
  }

  return verification;
}

function consumePhoneVerification(verificationId: string, phoneNumber: string) {
  const verification = getValidPhoneVerification(verificationId, {
    phoneNumber,
    purpose: "SIGNUP",
  });

  if (!verification) {
    return false;
  }

  verification.consumedAt = Date.now();
  return true;
}

function getValidEmailVerification(
  email: string,
  emailVerificationId: string,
  now = Date.now(),
) {
  const verification = emailVerificationRequests.get(email);

  if (
    !verification ||
    verification.verificationId !== emailVerificationId ||
    verification.verifiedAt === null ||
    verification.consumedAt !== null ||
    verification.verifiedAt + 30 * 60 * 1000 <= now
  ) {
    return null;
  }

  return verification;
}

function createEmailVerificationRequiredResponse() {
  return HttpResponse.json(
    {
      success: false,
      data: null,
      error: {
        code: "EMAIL_VERIFICATION_REQUIRED",
        message: "이메일 인증이 필요합니다.",
      },
    },
    { status: 400 },
  );
}

function createRefreshTokenCookie(refreshToken: string) {
  return [
    `${REFRESH_TOKEN_COOKIE_NAME}=${refreshToken}`,
    "HttpOnly",
    `Path=${REFRESH_TOKEN_COOKIE_PATH}`,
    "SameSite=Lax",
  ].join("; ");
}

function createExpiredRefreshTokenCookie() {
  return [
    `${REFRESH_TOKEN_COOKIE_NAME}=`,
    "HttpOnly",
    `Path=${REFRESH_TOKEN_COOKIE_PATH}`,
    "SameSite=Lax",
    "Max-Age=0",
  ].join("; ");
}

function createWithdrawalCooldownResponse() {
  return HttpResponse.json(
    {
      success: false,
      data: null,
      error: {
        code: "ACCOUNT_REJOIN_BLOCKED",
        message: "탈퇴 후 7일 동안 재가입할 수 없습니다.",
      },
    },
    { status: 409 },
  );
}

export const authHandlers = [
  http.post(
    getGatherApiUrl("/api/v1/auth/phone-verifications"),
    async ({ request }) => {
      const body = (await request.json()) as {
        phoneNumber?: string;
        purpose?: PhoneVerification["purpose"];
      };
      const phoneNumber = normalizeMockPhoneNumber(body.phoneNumber);

      if (
        !phoneNumber ||
        !/^010\d{8}$/.test(phoneNumber) ||
        !body.purpose ||
        !["SIGNUP", "FIND_ACCOUNT", "RESET_PASSWORD"].includes(body.purpose)
      ) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "VALIDATION_ERROR",
              message: "요청 값이 올바르지 않습니다.",
            },
          },
          { status: 400 },
        );
      }

      const verificationId = createMockVerificationId();
      const expiresAt = Date.now() + 5 * 60 * 1000;

      phoneVerificationRequests.set(verificationId, {
        phoneNumber,
        purpose: body.purpose,
        messageText: MOCK_PHONE_MESSAGE_TEXT,
        expiresAt,
        verifiedAt: null,
        consumedAt: null,
      });

      return HttpResponse.json(
        {
          success: true,
          data: {
            verificationId,
            receiverNumber: MOCK_PHONE_RECEIVER_NUMBER,
            messageText: MOCK_PHONE_MESSAGE_TEXT,
            expiresAt: new Date(expiresAt).toISOString(),
          },
          error: null,
        },
        { status: 201 },
      );
    },
  ),

  http.post(
    getGatherApiUrl("/api/v1/auth/phone-verifications/:verificationId/qr-code"),
    ({ params }) => {
      const verificationId = String(params.verificationId);
      const verification = phoneVerificationRequests.get(verificationId);

      if (!verification) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "PHONE_VERIFICATION_NOT_FOUND",
              message: "휴대폰 인증 요청을 찾을 수 없습니다.",
            },
          },
          { status: 404 },
        );
      }

      if (Date.now() >= verification.expiresAt) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "PHONE_VERIFICATION_EXPIRED",
              message: "휴대폰 인증 요청이 만료되었습니다.",
            },
          },
          { status: 400 },
        );
      }

      return HttpResponse.json(
        {
          success: true,
          data: {
            qrCode: MOCK_QR_CODE_DATA_URL,
          },
          error: null,
        },
        { status: 201 },
      );
    },
  ),

  http.post(
    getGatherApiUrl("/api/v1/auth/phone-verifications/:verificationId/confirm"),
    ({ params }) => {
      const verificationId = String(params.verificationId);
      const verification = phoneVerificationRequests.get(verificationId);

      if (!verification) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "PHONE_VERIFICATION_NOT_FOUND",
              message: "휴대폰 인증 요청을 찾을 수 없습니다.",
            },
          },
          { status: 404 },
        );
      }

      if (Date.now() >= verification.expiresAt) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "PHONE_VERIFICATION_EXPIRED",
              message: "휴대폰 인증 요청이 만료되었습니다.",
            },
          },
          { status: 400 },
        );
      }

      if (
        isWithdrawalCooldownActive({ phoneNumber: verification.phoneNumber })
      ) {
        return createWithdrawalCooldownResponse();
      }

      if (
        verification.purpose === "SIGNUP" &&
        mockUsers.some((user) => user.phoneNumber === verification.phoneNumber)
      ) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "DUPLICATE_PHONE_NUMBER",
              message: "이미 사용 중인 전화번호입니다.",
            },
          },
          { status: 409 },
        );
      }

      if (verification.verifiedAt !== null) {
        return HttpResponse.json({
          success: true,
          data: {
            status: "VERIFIED",
          },
          error: null,
        });
      }

      verification.verifiedAt = Date.now();

      return HttpResponse.json({
        success: true,
        data: {
          status: "VERIFIED",
        },
        error: null,
      });
    },
  ),

  http.post(
    getGatherApiUrl("/api/v1/auth/account-recoveries/email"),
    async ({ request }) => {
      const body = (await request.json()) as {
        phoneVerificationId?: string;
      };
      const verificationId = body.phoneVerificationId;

      if (!verificationId) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "VALIDATION_ERROR",
              message: "휴대폰 인증이 필요합니다.",
            },
          },
          { status: 400 },
        );
      }

      const storedVerification = phoneVerificationRequests.get(verificationId);

      if (storedVerification?.purpose !== "FIND_ACCOUNT") {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: storedVerification
                ? "PHONE_VERIFICATION_PURPOSE_MISMATCH"
                : "PHONE_VERIFICATION_NOT_FOUND",
              message: storedVerification
                ? "아이디 찾기용 휴대폰 인증이 아닙니다."
                : "휴대폰 인증 요청을 찾을 수 없습니다.",
            },
          },
          { status: storedVerification ? 400 : 404 },
        );
      }

      const verification = getValidPhoneVerification(verificationId, {
        purpose: "FIND_ACCOUNT",
      });

      if (!verification) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "PHONE_VERIFICATION_EXPIRED",
              message: "휴대폰 인증이 만료되었거나 이미 사용되었습니다.",
            },
          },
          { status: 400 },
        );
      }

      const user = mockUsers.find(
        (candidate) => candidate.phoneNumber === verification.phoneNumber,
      );
      verification.consumedAt = Date.now();

      if (!user) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "ACCOUNT_NOT_FOUND",
              message: "가입된 계정을 찾을 수 없습니다.",
            },
          },
          { status: 404 },
        );
      }

      return HttpResponse.json({
        success: true,
        data: user.password
          ? { loginType: "EMAIL", email: user.email }
          : { loginType: "KAKAO", email: null },
        error: null,
      });
    },
  ),

  http.post(
    getGatherApiUrl("/api/v1/auth/account-recoveries/password"),
    async ({ request }) => {
      const body = (await request.json()) as {
        phoneVerificationId?: string;
      };
      const verificationId = body.phoneVerificationId;

      if (!verificationId) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "VALIDATION_ERROR",
              message: "휴대폰 인증이 필요합니다.",
            },
          },
          { status: 400 },
        );
      }

      const storedVerification = phoneVerificationRequests.get(verificationId);

      if (storedVerification?.purpose !== "RESET_PASSWORD") {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: storedVerification
                ? "PHONE_VERIFICATION_PURPOSE_MISMATCH"
                : "PHONE_VERIFICATION_NOT_FOUND",
              message: storedVerification
                ? "비밀번호 재설정용 휴대폰 인증이 아닙니다."
                : "휴대폰 인증 요청을 찾을 수 없습니다.",
            },
          },
          { status: storedVerification ? 400 : 404 },
        );
      }

      const verification = getValidPhoneVerification(verificationId, {
        purpose: "RESET_PASSWORD",
      });

      if (!verification) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "PHONE_VERIFICATION_EXPIRED",
              message: "휴대폰 인증이 만료되었거나 이미 사용되었습니다.",
            },
          },
          { status: 400 },
        );
      }

      const user = mockUsers.find(
        (candidate) => candidate.phoneNumber === verification.phoneNumber,
      );
      verification.consumedAt = Date.now();

      if (!user) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "ACCOUNT_NOT_FOUND",
              message: "가입된 계정을 찾을 수 없습니다.",
            },
          },
          { status: 404 },
        );
      }

      if (!user.password) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "PASSWORD_RESET_NOT_AVAILABLE",
              message:
                "카카오로 가입한 계정은 비밀번호를 재설정할 수 없습니다.",
            },
          },
          { status: 409 },
        );
      }

      const passwordResetToken = createMockVerificationId();
      passwordResetTokens.set(passwordResetToken, {
        userId: user.id,
        expiresAt: Date.now() + 10 * 60 * 1000,
        consumedAt: null,
      });

      return HttpResponse.json({
        success: true,
        data: { passwordResetToken },
        error: null,
      });
    },
  ),

  http.post(
    getGatherApiUrl("/api/v1/auth/account-recoveries/password/reset"),
    async ({ request }) => {
      const body = (await request.json()) as {
        passwordResetToken?: string;
        password?: string;
        passwordConfirm?: string;
      };

      if (
        !body.passwordResetToken ||
        !body.password ||
        !body.passwordConfirm ||
        body.password.length < 6 ||
        body.password.length > 12 ||
        /\s/.test(body.password)
      ) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "VALIDATION_ERROR",
              message: "비밀번호는 6~12자의 공백 없는 문자열이어야 합니다.",
            },
          },
          { status: 400 },
        );
      }

      if (body.password !== body.passwordConfirm) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "PASSWORD_MISMATCH",
              message: "비밀번호가 일치하지 않습니다.",
            },
          },
          { status: 400 },
        );
      }

      const resetToken = passwordResetTokens.get(body.passwordResetToken);

      if (
        !resetToken ||
        resetToken.consumedAt !== null ||
        resetToken.expiresAt <= Date.now()
      ) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "VALIDATION_ERROR",
              message: "비밀번호 재설정 인증이 만료되었거나 유효하지 않습니다.",
            },
          },
          { status: 400 },
        );
      }

      const user = getMockUserById(resetToken.userId);

      if (!user || user.userStatus === "WITHDRAWN") {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "VALIDATION_ERROR",
              message: "비밀번호 재설정 인증이 유효하지 않습니다.",
            },
          },
          { status: 400 },
        );
      }

      user.password = body.password;
      resetToken.consumedAt = Date.now();

      return HttpResponse.json({
        success: true,
        data: null,
        error: null,
      });
    },
  ),

  http.post(
    getGatherApiUrl("/api/v1/auth/email-verifications"),
    async ({ request }) => {
      const body = (await request.json()) as { email?: string };
      const email = body.email?.trim().toLowerCase();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "VALIDATION_ERROR",
              message: "요청 값이 올바르지 않습니다.",
            },
          },
          { status: 400 },
        );
      }

      if (mockUsers.some((user) => user.email === email)) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "DUPLICATE_EMAIL",
              message: "이미 사용 중인 이메일입니다.",
            },
          },
          { status: 409 },
        );
      }

      const expiresAt = Date.now() + 10 * 60 * 1000;
      emailVerificationRequests.set(email, {
        code: "123456",
        expiresAt,
        verificationId: createMockVerificationId(),
        verifiedAt: null,
        consumedAt: null,
      });

      return HttpResponse.json({
        success: true,
        data: {
          email,
          expiresAt: new Date(expiresAt).toISOString(),
          message: "인증 코드가 발송되었습니다.",
        },
        error: null,
      });
    },
  ),

  http.post(
    getGatherApiUrl("/api/v1/auth/email-verifications/confirm"),
    async ({ request }) => {
      const body = (await request.json()) as {
        email?: string;
        code?: string;
      };

      const email = body.email?.trim().toLowerCase();
      const code = body.code;

      if (!email || !code) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "VALIDATION_ERROR",
              message: "요청 값이 올바르지 않습니다.",
            },
          },
          { status: 400 },
        );
      }

      const verification = emailVerificationRequests.get(email);

      if (!verification) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "EMAIL_VERIFICATION_NOT_FOUND",
              message: "이메일 인증 요청을 찾을 수 없습니다.",
            },
          },
          { status: 404 },
        );
      }

      if (Date.now() > verification.expiresAt) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "EXPIRED_VERIFICATION_CODE",
              message: "인증 코드가 만료되었습니다.",
            },
          },
          { status: 400 },
        );
      }

      if (code !== verification.code) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "INVALID_VERIFICATION_CODE",
              message: "인증 코드가 올바르지 않습니다.",
            },
          },
          { status: 400 },
        );
      }

      verification.verifiedAt ??= Date.now();

      return HttpResponse.json({
        success: true,
        data: {
          email,
          verified: true,
          verifiedAt: new Date(verification.verifiedAt).toISOString(),
          emailVerificationId: verification.verificationId,
        },
        error: null,
      });
    },
  ),

  http.post(getGatherApiUrl("/api/v1/auth/signup"), async ({ request }) => {
    const body = (await request.json()) as SignupRequest;

    if (
      !body.email ||
      !body.password ||
      !body.passwordConfirm ||
      !body.name ||
      !body.birthDate ||
      !body.gender ||
      !body.phoneNumber ||
      !body.phoneVerificationId ||
      !body.nickname ||
      typeof body.activityRegionId !== "number" ||
      !body.interestCategories ||
      typeof body.marketingAgreed !== "boolean"
    ) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "필수 정보를 모두 입력해 주세요.",
          },
        },
        { status: 400 },
      );
    }

    if (body.password !== body.passwordConfirm) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "PASSWORD_MISMATCH",
            message: "비밀번호가 일치하지 않습니다.",
          },
        },
        { status: 400 },
      );
    }

    if (!body.serviceTermsAgreed || !body.privacyPolicyAgreed) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "REQUIRED_TERMS_NOT_AGREED",
            message: "필수 약관 동의가 필요합니다.",
          },
        },
        { status: 400 },
      );
    }

    if (!validRegionIds.has(body.activityRegionId)) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "REGION_NOT_FOUND",
            message: "활동 지역을 찾을 수 없습니다.",
          },
        },
        { status: 404 },
      );
    }

    if (!validActivityRegionIds.has(body.activityRegionId)) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "INVALID_ACTIVITY_REGION",
            message: "활동 지역은 시도 또는 시군구 단위로 1개 선택해야 합니다.",
          },
        },
        { status: 400 },
      );
    }

    if (!body.interestCategories || body.interestCategories.length < 1) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "INVALID_INTEREST_CATEGORY_COUNT",
            message: "관심 카테고리는 1개 이상 선택해야 합니다.",
          },
        },
        { status: 400 },
      );
    }

    if (
      new Set(body.interestCategories).size !== body.interestCategories.length
    ) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "INVALID_INTEREST_CATEGORY_COUNT",
            message: "관심 카테고리는 중복 없이 1개 이상 선택해야 합니다.",
          },
        },
        { status: 400 },
      );
    }

    const email = body.email.trim().toLowerCase();
    const phoneNumber = normalizeMockPhoneNumber(body.phoneNumber);

    if (!phoneNumber) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "요청 값이 올바르지 않습니다.",
          },
        },
        { status: 400 },
      );
    }

    const emailVerification = body.emailVerificationId
      ? getValidEmailVerification(email, body.emailVerificationId)
      : null;

    if (!emailVerification) {
      return createEmailVerificationRequiredResponse();
    }

    const phoneVerification = getValidPhoneVerification(
      body.phoneVerificationId,
      { phoneNumber, purpose: "SIGNUP" },
    );

    if (!phoneVerification) {
      return createPhoneVerificationRequiredResponse();
    }

    if (isWithdrawalCooldownActive({ phoneNumber })) {
      return createWithdrawalCooldownResponse();
    }

    if (
      body.interestCategories.some(
        (category) => !validPostingCategories.has(category),
      )
    ) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "CATEGORY_NOT_FOUND",
            message: "존재하지 않는 관심 카테고리입니다.",
          },
        },
        { status: 404 },
      );
    }

    if (mockUsers.some((user) => user.email === email)) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "DUPLICATE_EMAIL",
            message: "이미 가입된 이메일입니다.",
          },
        },
        { status: 409 },
      );
    }

    if (mockUsers.some((user) => user.phoneNumber === phoneNumber)) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "DUPLICATE_PHONE_NUMBER",
            message: "이미 가입된 전화번호입니다.",
          },
        },
        { status: 409 },
      );
    }

    if (mockUsers.some((user) => user.nickname === body.nickname)) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "DUPLICATE_NICKNAME",
            message: "이미 사용 중인 닉네임입니다.",
          },
        },
        { status: 409 },
      );
    }

    const consumedAt = Date.now();
    emailVerification.consumedAt = consumedAt;
    phoneVerification.consumedAt = consumedAt;

    const newUser: MockUser = {
      id: getNextMockUserId(),
      name: body.name,
      birthDate: body.birthDate,
      gender: body.gender,
      phoneNumber,
      email,
      password: body.password,
      nickname: body.nickname,
      introduction: body.introduction?.trim() || null,
      activityRegionId: body.activityRegionId,
      interestCategories: body.interestCategories,
    };

    addMockUser(newUser);

    const refreshToken = createMockRefreshToken(newUser.id);

    return HttpResponse.json(
      {
        success: true,
        data: {
          userId: newUser.id,
          email: newUser.email,
          name: newUser.name,
          nickname: newUser.nickname,
          accessToken: createMockAccessToken(newUser.id),
          tokenType: "Bearer",
        },
        error: null,
      },
      {
        status: 201,
        headers: {
          "Set-Cookie": createRefreshTokenCookie(refreshToken),
        },
      },
    );
  }),

  http.post(
    getGatherApiUrl("/api/v1/auth/kakao/login"),
    async ({ request }) => {
      const body = (await request.json()) as {
        authorizationCode?: string;
        redirectUri?: string;
      };

      if (!body.authorizationCode || !body.redirectUri) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "VALIDATION_ERROR",
              message: "요청 값이 올바르지 않습니다.",
            },
          },
          { status: 400 },
        );
      }

      if (body.authorizationCode === "mock-kakao-suspended") {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "SUSPENDED_USER",
              message: "이용 정지된 계정입니다.",
            },
          },
          { status: 403 },
        );
      }

      if (body.authorizationCode === "mock-kakao-withdrawn") {
        return createWithdrawalCooldownResponse();
      }

      if (body.authorizationCode === "mock-kakao-unavailable") {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "KAKAO_API_UNAVAILABLE",
              message: "카카오 로그인 서비스를 일시적으로 사용할 수 없습니다.",
            },
          },
          { status: 503 },
        );
      }

      if (body.authorizationCode === "mock-kakao-new-user") {
        return HttpResponse.json({
          success: true,
          data: {
            signupStatus: "ADDITIONAL_INFO_REQUIRED",
            signupToken: MOCK_KAKAO_SIGNUP_TOKEN,
            profile: { nickname: "카카오사용자" },
          },
          error: null,
        });
      }

      if (body.authorizationCode === "mock-kakao-expired-signup") {
        return HttpResponse.json({
          success: true,
          data: {
            signupStatus: "ADDITIONAL_INFO_REQUIRED",
            signupToken: MOCK_EXPIRED_KAKAO_SIGNUP_TOKEN,
            profile: { nickname: "카카오사용자" },
          },
          error: null,
        });
      }

      if (body.authorizationCode === "mock-kakao-invalid-signup") {
        return HttpResponse.json({
          success: true,
          data: {
            signupStatus: "ADDITIONAL_INFO_REQUIRED",
            signupToken: MOCK_INVALID_KAKAO_SIGNUP_TOKEN,
            profile: { nickname: "카카오사용자" },
          },
          error: null,
        });
      }

      if (body.authorizationCode === "mock-kakao-already-registered") {
        return HttpResponse.json({
          success: true,
          data: {
            signupStatus: "ADDITIONAL_INFO_REQUIRED",
            signupToken: MOCK_ALREADY_REGISTERED_KAKAO_SIGNUP_TOKEN,
            profile: { nickname: "카카오사용자" },
          },
          error: null,
        });
      }

      if (body.authorizationCode === "mock-kakao-existing-user") {
        if (isWithdrawalCooldownActive({ userId: 1 })) {
          return createWithdrawalCooldownResponse();
        }

        const refreshToken = createMockRefreshToken(1);

        return HttpResponse.json(
          {
            success: true,
            data: {
              signupStatus: "LOGIN_COMPLETED",
              accessToken: createMockAccessToken(1),
              tokenType: "Bearer",
            },
            error: null,
          },
          {
            headers: {
              "Set-Cookie": createRefreshTokenCookie(refreshToken),
            },
          },
        );
      }

      // 실제 카카오 인가 코드는 매번 달라 로컬 MSW에서는 신규 회원 흐름을 기본으로 검증한다.
      return HttpResponse.json({
        success: true,
        data: {
          signupStatus: "ADDITIONAL_INFO_REQUIRED",
          signupToken: MOCK_KAKAO_SIGNUP_TOKEN,
          profile: { nickname: "카카오사용자" },
        },
        error: null,
      });
    },
  ),

  http.post(
    getGatherApiUrl("/api/v1/auth/kakao/signup"),
    async ({ request }) => {
      const signupToken = request.headers.get("X-Signup-Token");
      const body = (await request.json()) as KakaoSignupRequest;

      if (signupToken === MOCK_EXPIRED_KAKAO_SIGNUP_TOKEN) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "SIGNUP_TOKEN_EXPIRED",
              message: "가입 인증이 만료되었습니다.",
            },
          },
          { status: 401 },
        );
      }

      if (!signupToken || signupToken !== MOCK_KAKAO_SIGNUP_TOKEN) {
        if (signupToken === MOCK_ALREADY_REGISTERED_KAKAO_SIGNUP_TOKEN) {
          return HttpResponse.json(
            {
              success: false,
              data: null,
              error: {
                code: "ALREADY_REGISTERED",
                message: "이미 가입된 계정입니다.",
              },
            },
            { status: 409 },
          );
        }

        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "SIGNUP_TOKEN_INVALID",
              message: "유효하지 않은 가입 인증입니다.",
            },
          },
          { status: 401 },
        );
      }

      if (
        "email" in body ||
        "password" in body ||
        "passwordConfirm" in body ||
        !body.name ||
        !body.birthDate ||
        !body.gender ||
        !body.phoneNumber ||
        !body.phoneVerificationId ||
        !body.nickname ||
        typeof body.activityRegionId !== "number" ||
        !body.interestCategories ||
        typeof body.marketingAgreed !== "boolean"
      ) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "VALIDATION_ERROR",
              message: "필수 정보를 모두 입력해 주세요.",
            },
          },
          { status: 400 },
        );
      }

      if (!body.serviceTermsAgreed || !body.privacyPolicyAgreed) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "REQUIRED_TERMS_NOT_AGREED",
              message: "필수 약관 동의가 필요합니다.",
            },
          },
          { status: 400 },
        );
      }

      const phoneNumber = normalizeMockPhoneNumber(body.phoneNumber);

      if (!phoneNumber) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "VALIDATION_ERROR",
              message: "요청 값이 올바르지 않습니다.",
            },
          },
          { status: 400 },
        );
      }

      if (isWithdrawalCooldownActive({ phoneNumber })) {
        return createWithdrawalCooldownResponse();
      }

      if (mockUsers.some((user) => user.phoneNumber === phoneNumber)) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "DUPLICATE_PHONE_NUMBER",
              message: "이미 사용 중인 전화번호입니다.",
            },
          },
          { status: 409 },
        );
      }

      if (mockUsers.some((user) => user.nickname === body.nickname)) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "DUPLICATE_NICKNAME",
              message: "이미 사용 중인 닉네임입니다.",
            },
          },
          { status: 409 },
        );
      }

      if (!consumePhoneVerification(body.phoneVerificationId, phoneNumber)) {
        return createPhoneVerificationRequiredResponse();
      }

      const userId = getNextMockUserId();
      const user: MockUser = {
        id: userId,
        name: body.name,
        birthDate: body.birthDate,
        gender: body.gender,
        phoneNumber,
        email: `mock-kakao-${userId}@example.com`,
        password: "",
        nickname: body.nickname,
        introduction: body.introduction?.trim() || null,
        activityRegionId: body.activityRegionId,
        interestCategories: body.interestCategories,
      };
      const refreshToken = createMockRefreshToken(userId);

      addMockUser(user);

      return HttpResponse.json(
        {
          success: true,
          data: {
            accessToken: createMockAccessToken(userId),
            tokenType: "Bearer",
          },
          error: null,
        },
        {
          status: 201,
          headers: {
            "Set-Cookie": createRefreshTokenCookie(refreshToken),
          },
        },
      );
    },
  ),

  http.post(getGatherApiUrl("/api/v1/auth/login"), async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "이메일과 비밀번호를 입력해 주세요.",
          },
        },
        { status: 400 },
      );
    }

    const user = mockUsers.find(
      (candidate) =>
        candidate.email === email && candidate.password === password,
    );

    if (!user) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "INVALID_LOGIN",
            message: "이메일 또는 비밀번호가 올바르지 않습니다.",
          },
        },
        { status: 401 },
      );
    }

    const refreshToken = createMockRefreshToken(user.id);

    return HttpResponse.json(
      {
        success: true,
        data: {
          accessToken: createMockAccessToken(user.id),
          tokenType: "Bearer",
        },
        error: null,
      },
      {
        headers: {
          "Set-Cookie": createRefreshTokenCookie(refreshToken),
        },
      },
    );
  }),

  http.post(getGatherApiUrl("/api/v1/auth/reissue"), ({ cookies }) => {
    const refreshToken = cookies[REFRESH_TOKEN_COOKIE_NAME];

    if (!refreshToken) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "인증 정보가 없습니다.",
          },
        },
        { status: 401 },
      );
    }

    const userId = getMockUserIdFromRefreshToken(refreshToken);

    if (userId === null || !getMockUserById(userId)) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "REVOKED_TOKEN",
            message: "폐기된 토큰입니다.",
          },
        },
        { status: 401 },
      );
    }

    const nextRefreshToken = createMockRefreshToken(userId);

    return HttpResponse.json(
      {
        success: true,
        data: {
          accessToken: createMockAccessToken(userId),
          tokenType: "Bearer",
        },
        error: null,
      },
      {
        headers: {
          "Set-Cookie": createRefreshTokenCookie(nextRefreshToken),
        },
      },
    );
  }),

  http.post(getGatherApiUrl("/api/v1/auth/session/restore"), ({ cookies }) => {
    const refreshToken = cookies[REFRESH_TOKEN_COOKIE_NAME];
    const userId = refreshToken
      ? getMockUserIdFromRefreshToken(refreshToken)
      : null;

    if (userId === null || !getMockUserById(userId)) {
      return HttpResponse.json({
        success: true,
        data: {
          authenticated: false,
          accessToken: null,
          tokenType: null,
        },
        error: null,
      });
    }

    return HttpResponse.json({
      success: true,
      data: {
        authenticated: true,
        accessToken: createMockAccessToken(userId),
        tokenType: "Bearer",
      },
      error: null,
    });
  }),

  http.post(getGatherApiUrl("/api/v1/auth/logout"), ({ cookies }) => {
    const refreshToken = cookies[REFRESH_TOKEN_COOKIE_NAME];
    const userId = refreshToken
      ? getMockUserIdFromRefreshToken(refreshToken)
      : null;

    if (userId === null || !getMockUserById(userId)) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "INVALID_TOKEN",
            message: "유효하지 않은 토큰입니다.",
          },
        },
        { status: 401 },
      );
    }

    return HttpResponse.json(
      {
        success: true,
        data: null,
        error: null,
      },
      {
        headers: {
          "Set-Cookie": createExpiredRefreshTokenCookie(),
        },
      },
    );
  }),

  http.delete(getGatherApiUrl("/api/v1/users/me"), ({ request }) => {
    const userId = getMockUserId(request);

    if (userId === null) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "인증이 필요합니다.",
          },
        },
        { status: 401 },
      );
    }

    const existingResult = accountTerminationResults.get(userId);

    if (existingResult) {
      return HttpResponse.json(
        { success: true, data: existingResult, error: null },
        {
          status: existingResult.status === "ACCEPTED" ? 202 : 200,
          headers: { "Set-Cookie": createExpiredRefreshTokenCookie() },
        },
      );
    }

    const user = getMockUserById(userId);

    if (!user) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "인증이 필요합니다.",
          },
        },
        { status: 401 },
      );
    }

    const result = {
      status: user.password ? ("COMPLETED" as const) : ("ACCEPTED" as const),
      occurredAt: new Date().toISOString(),
    };

    accountTerminationResults.set(userId, result);
    withdrawMockUser(userId);

    return HttpResponse.json(
      { success: true, data: result, error: null },
      {
        status: result.status === "ACCEPTED" ? 202 : 200,
        headers: { "Set-Cookie": createExpiredRefreshTokenCookie() },
      },
    );
  }),
];
