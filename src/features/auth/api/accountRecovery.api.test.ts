import { describe, expect, it } from "vitest";

import {
  confirmPhoneVerification,
  findAccountByPhoneVerification,
  issuePasswordResetToken,
  resetPassword,
  startPhoneVerification,
} from "@/features/auth/api/auth.api";
import { mockUsers } from "@/mocks/data/mockUsers";

describe("account recovery API contract", () => {
  it.each(["FIND_ACCOUNT", "RESET_PASSWORD"] as const)(
    "전화번호 인증 시작 시 purpose=%s를 전달한다",
    async (purpose) => {
      const response = await startPhoneVerification({
        phoneNumber: `010${String(Date.now()).slice(-8)}`,
        purpose,
      });

      expect(response.verificationId).toEqual(expect.any(String));
    },
  );

  it("인증된 전화번호 verificationId만 아이디 찾기 요청에 사용한다", async () => {
    const startResponse = await startPhoneVerification({
      phoneNumber: "01012345678",
      purpose: "FIND_ACCOUNT",
    });
    await confirmPhoneVerification(startResponse.verificationId);

    const account = await findAccountByPhoneVerification({
      phoneVerificationId: startResponse.verificationId,
    });

    expect(account).toEqual({
      loginType: "EMAIL",
      email: "test@example.com",
    });
  });

  it("비밀번호 재설정 permission API는 phoneVerificationId만 전달하는 계약을 유지한다", async () => {
    const startResponse = await startPhoneVerification({
      phoneNumber: "01012345678",
      purpose: "RESET_PASSWORD",
    });
    await confirmPhoneVerification(startResponse.verificationId);

    const permission = await issuePasswordResetToken({
      phoneVerificationId: startResponse.verificationId,
    });

    expect(permission.passwordResetToken).toEqual(expect.any(String));

    const user = mockUsers.find(
      (candidate) => candidate.phoneNumber === "01012345678",
    );
    const previousPassword = user?.password;

    try {
      await expect(
        resetPassword({
          passwordResetToken: permission.passwordResetToken,
          password: "password2",
          passwordConfirm: "password2",
        }),
      ).resolves.toBeNull();
    } finally {
      if (user && previousPassword !== undefined) {
        user.password = previousPassword;
      }
    }
  });
});
