import { describe, expect, it, vi } from "vitest";
import { HttpResponse, http } from "msw";

import {
  confirmPhoneVerification,
  createPhoneVerificationQrCode,
  startPhoneVerification,
} from "@/features/auth/api/auth.api";
import { getGatherApiUrl } from "@/mocks/apiScope";
import { server } from "@/mocks/server";

let phoneSequence = 0;

function createTestPhoneNumber() {
  phoneSequence += 1;

  return `010${String(phoneSequence).padStart(8, "0")}`;
}

describe("전화번호 인증 API 및 MSW dynamic route", () => {
  it("start 후 dynamic confirm route가 매칭되고 첫 confirm에서 VERIFIED가 된다", async () => {
    const startResponse = await startPhoneVerification({
      phoneNumber: createTestPhoneNumber(),
    });

    expect(startResponse.verificationId).toEqual(expect.any(String));

    await expect(
      confirmPhoneVerification(startResponse.verificationId),
    ).resolves.toEqual({ status: "VERIFIED" });
  });

  it("동일 verificationId의 confirm은 반복해도 VERIFIED를 반환한다", async () => {
    const startResponse = await startPhoneVerification({
      phoneNumber: createTestPhoneNumber(),
    });

    await confirmPhoneVerification(startResponse.verificationId);

    await expect(
      confirmPhoneVerification(startResponse.verificationId),
    ).resolves.toEqual({ status: "VERIFIED" });
  });

  it("dynamic QR code route가 verificationId와 함께 매칭된다", async () => {
    const startResponse = await startPhoneVerification({
      phoneNumber: createTestPhoneNumber(),
    });

    await expect(
      createPhoneVerificationQrCode(startResponse.verificationId),
    ).resolves.toMatchObject({ qrCode: expect.stringContaining("data:image") });
  });

  it("PENDING 응답은 테스트별 handler override로 시뮬레이션할 수 있다", async () => {
    const startResponse = await startPhoneVerification({
      phoneNumber: createTestPhoneNumber(),
    });

    server.use(
      http.post(
        getGatherApiUrl(
          "/api/v1/auth/phone-verifications/:verificationId/confirm",
        ),
        () =>
          HttpResponse.json({
            success: true,
            data: { status: "PENDING" },
            error: null,
          }),
      ),
    );

    await expect(
      confirmPhoneVerification(startResponse.verificationId),
    ).resolves.toEqual({ status: "PENDING" });
  });

  it("만료된 verificationId는 confirm에서 거부된다", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });

    try {
      const startedAt = new Date("2026-08-16T10:00:00.000Z");
      vi.setSystemTime(startedAt);

      const startResponse = await startPhoneVerification({
        phoneNumber: createTestPhoneNumber(),
      });

      vi.setSystemTime(startedAt.getTime() + 5 * 60 * 1000);

      await expect(
        confirmPhoneVerification(startResponse.verificationId),
      ).rejects.toMatchObject({
        status: 400,
        code: "PHONE_VERIFICATION_EXPIRED",
      });
    } finally {
      vi.useRealTimers();
    }
  });
});
