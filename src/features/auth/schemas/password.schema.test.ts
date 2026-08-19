import { describe, expect, it } from "vitest";

import { passwordResetSchema } from "@/features/auth/schemas/password.schema";

function parsePassword(password: string, passwordConfirm = password) {
  return passwordResetSchema.safeParse({ password, passwordConfirm });
}

describe("passwordResetSchema", () => {
  it.each([
    ["5자", "abcde"],
    ["13자", "a".repeat(13)],
    ["공백 포함", "abc de"],
  ])("정책에 맞지 않는 비밀번호(%s)를 거부한다", (_label, password) => {
    expect(parsePassword(password).success).toBe(false);
  });

  it.each(["a".repeat(6), "a".repeat(12)])(
    "6~12자 비밀번호를 허용한다: %s",
    (password) => {
      expect(parsePassword(password).success).toBe(true);
    },
  );

  it("비밀번호 확인이 다르면 passwordConfirm 오류를 반환한다", () => {
    const result = parsePassword("password1", "password2");

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(
      result.error.issues.find(
        (issue) => issue.message === "비밀번호가 일치하지 않습니다.",
      )?.path,
    ).toEqual(["passwordConfirm"]);
  });

  it("동일한 비밀번호와 확인값을 허용한다", () => {
    expect(parsePassword("password1").success).toBe(true);
  });
});
