import { describe, expect, it } from "vitest";

import {
  confirmPhoneVerification,
  startPhoneVerification,
} from "@/features/auth/api/auth.api";

describe("전화번호 인증 API contract", () => {
  it("start 응답의 verificationId로 dynamic confirm route를 호출할 수 있다", async () => {
    const startResponse = await startPhoneVerification({
      phoneNumber: `010${String(Date.now()).slice(-8)}`,
      purpose: "SIGNUP",
    });

    expect(startResponse.verificationId).toEqual(expect.any(String));
    await expect(
      confirmPhoneVerification(startResponse.verificationId),
    ).resolves.toEqual({ status: "VERIFIED" });
  });
});
