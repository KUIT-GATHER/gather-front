import { describe, expect, it } from "vitest";

import {
  confirmEmailVerification,
  sendEmailVerification,
} from "@/features/auth/api/auth.api";

describe("이메일 인증 API contract", () => {
  it("confirm 응답으로 이메일 인증 proof ID를 받을 수 있다", async () => {
    const email = `email-proof-${Date.now()}@example.com`;

    await sendEmailVerification({ email });
    const response = await confirmEmailVerification({
      email,
      code: "123456",
    });

    expect(response).toMatchObject({
      email,
      verified: true,
      verifiedAt: expect.any(String),
      emailVerificationId: expect.any(String),
    });
  });
});
