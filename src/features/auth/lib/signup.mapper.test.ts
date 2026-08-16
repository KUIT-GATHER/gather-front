import { describe, expect, it } from "vitest";

import {
  toEmailSignupRequest,
  toKakaoSignupRequest,
} from "@/features/auth/lib/signup.mapper";
import type { EmailSignupFormValues } from "@/features/auth/schemas/emailSignup.schema";
import type { KakaoSignupFormValues } from "@/features/auth/schemas/kakaoSignup.schema";

const emailValues: EmailSignupFormValues = {
  name: "홍길동",
  birthDate: "2000-01-01",
  gender: "MALE",
  phoneNumber: "01012345678",
  email: " Test@Example.com ",
  emailVerificationCode: "123456",
  password: "password1",
  passwordConfirm: "password1",
  nickname: "길동",
  introduction: "소개",
  activityRegionId: 41,
  interestCategories: ["ENVIRONMENT"],
  serviceTermsAgreed: true,
  privacyPolicyAgreed: true,
  marketingAgreed: false,
};

const kakaoValues: KakaoSignupFormValues = {
  name: "김카카오",
  birthDate: "2000-01-01",
  gender: "FEMALE",
  phoneNumber: "01087654321",
  nickname: "카카오",
  introduction: "소개",
  activityRegionId: 41,
  interestCategories: ["COMMUNITY"],
  serviceTermsAgreed: true,
  privacyPolicyAgreed: true,
  marketingAgreed: false,
};

describe("signup request mapper", () => {
  it("이메일 signup body에 emailVerificationId를 포함한다", () => {
    expect(
      toEmailSignupRequest(emailValues, "phone-id", "email-verification-id"),
    ).toMatchObject({
      email: "test@example.com",
      emailVerificationId: "email-verification-id",
    });
  });

  it("카카오 signup body에는 emailVerificationId를 추가하지 않는다", () => {
    expect(toKakaoSignupRequest(kakaoValues, "phone-id")).not.toHaveProperty(
      "emailVerificationId",
    );
  });
});
