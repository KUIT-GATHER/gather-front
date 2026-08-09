import { describe, expect, it } from "vitest";

import {
  signupEmailSchema,
  type EmailSignupFormValues,
} from "@/features/auth/schemas/emailSignup.schema";

const validEmailSignupData: EmailSignupFormValues = {
  name: "가더",
  birthDate: "2000. 01. 01",
  gender: "MALE",
  phoneNumber: "01012345678",
  nickname: "테스터",
  introduction: "",
  activityRegionId: 201,
  interestCategories: ["ENVIRONMENT"],
  serviceTermsAgreed: true,
  privacyPolicyAgreed: true,
  marketingAgreed: false,
  email: "user@example.com",
  emailVerificationCode: "123456",
  password: "password1",
  passwordConfirm: "password1",
};

function parseEmailSignupData(overrides: Partial<EmailSignupFormValues> = {}) {
  return signupEmailSchema.safeParse({
    ...validEmailSignupData,
    ...overrides,
  });
}

describe("signupEmailSchema", () => {
  it("유효한 이메일 가입 정보를 허용한다", () => {
    expect(parseEmailSignupData().success).toBe(true);
  });

  it("잘못된 이메일 형식을 거부한다", () => {
    expect(parseEmailSignupData({ email: "invalid-email" }).success).toBe(
      false,
    );
  });

  it("이메일의 앞뒤 공백을 제거한다", () => {
    const result = parseEmailSignupData({ email: "  USER@EXAMPLE.COM  " });

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.data.email).toBe("USER@EXAMPLE.COM");
  });

  it.each(["12345", "1234567", "12a456"])(
    "6자리 숫자가 아닌 인증번호를 거부한다: %s",
    (emailVerificationCode) => {
      expect(parseEmailSignupData({ emailVerificationCode }).success).toBe(
        false,
      );
    },
  );

  it.each([
    ["5자리", "abcde"],
    ["13자리", "a".repeat(13)],
    ["공백 포함", "abc de"],
  ])("비밀번호 %s를 거부한다", (_description, password) => {
    expect(
      parseEmailSignupData({
        password,
        passwordConfirm: password,
      }).success,
    ).toBe(false);
  });

  it("비밀번호 불일치 오류를 passwordConfirm 경로에 추가한다", () => {
    const result = parseEmailSignupData({
      password: "password1",
      passwordConfirm: "password2",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    const mismatchIssue = result.error.issues.find(
      (issue) => issue.message === "비밀번호가 일치하지 않습니다.",
    );

    expect(mismatchIssue?.path).toEqual(["passwordConfirm"]);
  });
});
