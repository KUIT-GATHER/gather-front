import { describe, expect, it } from "vitest";

import {
  signupCommonSchema,
  type SignupCommonFormValues,
} from "@/features/auth/schemas/signupCommon.schema";

const validSignupData: SignupCommonFormValues = {
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
};

function parseSignupData(overrides: Partial<SignupCommonFormValues> = {}) {
  return signupCommonSchema.safeParse({
    ...validSignupData,
    ...overrides,
  });
}

describe("signupCommonSchema", () => {
  it("유효한 기본 가입 정보를 허용한다", () => {
    expect(parseSignupData().success).toBe(true);
  });

  it.each([
    ["한글 최소 미만", "가", false],
    ["한글 최소", "가나", true],
    ["한글 최대", "가".repeat(10), true],
    ["한글 최대 초과", "가".repeat(11), false],
  ])("이름 %s 경계를 검증한다", (_description, name, expected) => {
    expect(parseSignupData({ name }).success).toBe(expected);
  });

  it.each([
    ["영문 최소 미만", "a", false],
    ["영문 최소", "ab", true],
    ["영문 최대", "a".repeat(20), true],
    ["영문 최대 초과", "a".repeat(21), false],
  ])("영문 이름 %s 경계를 검증한다", (_description, name, expected) => {
    expect(parseSignupData({ name }).success).toBe(expected);
  });

  it.each(["가더Gather", "가더 모임"])(
    "한영 혼합 또는 공백이 포함된 이름을 거부한다: %s",
    (name) => {
      expect(parseSignupData({ name }).success).toBe(false);
    },
  );

  it("올바르지 않은 생년월일을 거부한다", () => {
    expect(parseSignupData({ birthDate: "2025. 02. 29" }).success).toBe(false);
  });

  it.each(["010123456", "010123456789"])(
    "%s 자리 전화번호를 거부한다",
    (phoneNumber) => {
      expect(parseSignupData({ phoneNumber }).success).toBe(false);
    },
  );

  it("활동 지역을 선택하지 않으면 거부한다", () => {
    expect(parseSignupData({ activityRegionId: null }).success).toBe(false);
  });

  it("관심 카테고리가 없거나 중복되면 거부한다", () => {
    expect(parseSignupData({ interestCategories: [] }).success).toBe(false);
    expect(
      parseSignupData({ interestCategories: ["ENVIRONMENT", "ENVIRONMENT"] })
        .success,
    ).toBe(false);
  });

  it.each([
    ["서비스 이용약관", { serviceTermsAgreed: false }],
    ["개인정보 수집 및 이용약관", { privacyPolicyAgreed: false }],
  ])("필수 약관 %s 미동의를 거부한다", (_label, overrides) => {
    expect(parseSignupData(overrides).success).toBe(false);
  });

  it("마케팅 약관 미동의는 허용한다", () => {
    expect(parseSignupData({ marketingAgreed: false }).success).toBe(true);
  });
});
