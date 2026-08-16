import { describe, expect, it, vi } from "vitest";

import {
  confirmEmailVerification,
  confirmPhoneVerification,
  sendEmailVerification,
  signup,
  startPhoneVerification,
} from "@/features/auth/api/auth.api";
import type { EmailSignupRequest } from "@/features/auth/types/auth.types";
import { ApiError } from "@/shared/api/apiError";
import { fetchClient } from "@/shared/api/fetchClient";

let testSequence = 0;

function createTestIdentity() {
  testSequence += 1;
  const suffix = `${Date.now()}${testSequence}`;

  return {
    email: `email-proof-${suffix}@example.com`,
    phoneNumber: `010${suffix.slice(-8)}`,
    nickname: `email-proof-${testSequence}`,
  };
}

async function createVerifiedPhone(phoneNumber: string) {
  const response = await startPhoneVerification({ phoneNumber });

  await confirmPhoneVerification(response.verificationId);
  await confirmPhoneVerification(response.verificationId);

  return response.verificationId;
}

async function createEmailProof(email: string) {
  await sendEmailVerification({ email });

  return confirmEmailVerification({ email, code: "123456" });
}

function createSignupRequest(
  email: string,
  phoneNumber: string,
  nickname: string,
  phoneVerificationId: string,
  emailVerificationId: string,
): EmailSignupRequest {
  return {
    name: "이메일회원",
    birthDate: "2000-01-01",
    gender: "MALE",
    phoneNumber,
    phoneVerificationId,
    nickname,
    introduction: null,
    activityRegionId: 41,
    interestCategories: ["ENVIRONMENT"],
    serviceTermsAgreed: true,
    privacyPolicyAgreed: true,
    marketingAgreed: false,
    email,
    emailVerificationId,
    password: "password1",
    passwordConfirm: "password1",
  };
}

describe("이메일 인증 proof API 및 MSW 정책", () => {
  it("confirm 성공 응답에 현재 emailVerificationId를 포함한다", async () => {
    const identity = createTestIdentity();
    const response = await createEmailProof(identity.email);

    expect(response).toMatchObject({
      email: identity.email,
      verified: true,
    });
    expect(response.emailVerificationId).toEqual(expect.any(String));
  });

  it("이메일 proof 없이 signup하면 EMAIL_VERIFICATION_REQUIRED를 반환한다", async () => {
    const identity = createTestIdentity();
    const phoneVerificationId = await createVerifiedPhone(identity.phoneNumber);
    const request = createSignupRequest(
      identity.email,
      identity.phoneNumber,
      identity.nickname,
      phoneVerificationId,
      "missing-email-verification-id",
    );
    const requestWithoutEmailProof = Object.fromEntries(
      Object.entries(request).filter(([key]) => key !== "emailVerificationId"),
    );

    await expect(
      fetchClient("/api/v1/auth/signup", {
        method: "POST",
        withCredentials: true,
        body: JSON.stringify(requestWithoutEmailProof),
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: "EMAIL_VERIFICATION_REQUIRED",
    });
  });

  it("재발송 전 proof는 거부되고 새 proof만 signup에 사용할 수 있다", async () => {
    const identity = createTestIdentity();
    const firstProof = await createEmailProof(identity.email);
    await sendEmailVerification({ email: identity.email });
    const secondProof = await confirmEmailVerification({
      email: identity.email,
      code: "123456",
    });
    const phoneVerificationId = await createVerifiedPhone(identity.phoneNumber);

    expect(secondProof.emailVerificationId).not.toBe(
      firstProof.emailVerificationId,
    );

    await expect(
      signup(
        createSignupRequest(
          identity.email,
          identity.phoneNumber,
          identity.nickname,
          phoneVerificationId,
          firstProof.emailVerificationId,
        ),
      ),
    ).rejects.toMatchObject({
      status: 400,
      code: "EMAIL_VERIFICATION_REQUIRED",
    });

    await expect(
      signup(
        createSignupRequest(
          identity.email,
          identity.phoneNumber,
          identity.nickname,
          phoneVerificationId,
          secondProof.emailVerificationId,
        ),
      ),
    ).resolves.toMatchObject({ email: identity.email });
  });

  it("signup 성공 후 emailVerificationId를 재사용할 수 없다", async () => {
    const identity = createTestIdentity();
    const emailProof = await createEmailProof(identity.email);
    const phoneVerificationId = await createVerifiedPhone(identity.phoneNumber);
    const request = createSignupRequest(
      identity.email,
      identity.phoneNumber,
      identity.nickname,
      phoneVerificationId,
      emailProof.emailVerificationId,
    );

    await expect(signup(request)).resolves.toMatchObject({
      email: identity.email,
    });
    await expect(signup(request)).rejects.toMatchObject({
      status: 400,
      code: "EMAIL_VERIFICATION_REQUIRED",
    });
  });

  it("email proof가 만료되면 30분 후 signup을 거부한다", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });

    try {
      const verifiedAt = new Date("2026-08-16T10:00:00.000Z");
      vi.setSystemTime(verifiedAt);

      const identity = createTestIdentity();
      const emailProof = await createEmailProof(identity.email);

      vi.setSystemTime(verifiedAt.getTime() + 30 * 60 * 1000);

      await expect(
        signup(
          createSignupRequest(
            identity.email,
            identity.phoneNumber,
            identity.nickname,
            "phone-verification-id",
            emailProof.emailVerificationId,
          ),
        ),
      ).rejects.toMatchObject({
        status: 400,
        code: "EMAIL_VERIFICATION_REQUIRED",
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it("phone proof 검증 실패 시 email proof를 먼저 소비하지 않는다", async () => {
    const identity = createTestIdentity();
    const emailProof = await createEmailProof(identity.email);
    const request = createSignupRequest(
      identity.email,
      identity.phoneNumber,
      identity.nickname,
      "invalid-phone-verification-id",
      emailProof.emailVerificationId,
    );

    await expect(signup(request)).rejects.toMatchObject({
      status: 400,
      code: "PHONE_VERIFICATION_REQUIRED",
    });

    const phoneVerificationId = await createVerifiedPhone(identity.phoneNumber);
    await expect(
      signup({ ...request, phoneVerificationId }),
    ).resolves.toMatchObject({ email: identity.email });
  });

  it("EMAIL_VERIFICATION_REQUIRED는 ApiError로 전달된다", async () => {
    const identity = createTestIdentity();
    const phoneVerificationId = await createVerifiedPhone(identity.phoneNumber);

    let caughtError: unknown;

    try {
      await signup(
        createSignupRequest(
          identity.email,
          identity.phoneNumber,
          identity.nickname,
          phoneVerificationId,
          "invalid-email-verification-id",
        ),
      );
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(ApiError);
    if (caughtError instanceof ApiError) {
      expect(caughtError.code).toBe("EMAIL_VERIFICATION_REQUIRED");
    }
  });
});
